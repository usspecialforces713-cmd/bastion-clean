<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function jsonResponse(int $status, array $payload): never { http_response_code($status); echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); exit; }
function requireMethod(string $method): void { if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') !== strtoupper($method)) { header('Allow: ' . strtoupper($method)); jsonResponse(405, ['ok'=>false,'error'=>'Method not allowed.']); } }
function requestBody(): array { $raw=file_get_contents('php://input'); $v=$raw ? json_decode($raw,true) : []; return is_array($v) ? $v : []; }
function db(): PDO {
 static $pdo=null; if ($pdo instanceof PDO) return $pdo;
 $url=getenv('DATABASE_URL') ?: ''; if (!$url) { error_log('[Bastion] DATABASE_URL missing'); jsonResponse(500,['ok'=>false,'error'=>'Database is not configured.']); }
 $p=parse_url($url); if (!$p || empty($p['host']) || empty($p['path'])) { error_log('[Bastion] Invalid DATABASE_URL'); jsonResponse(500,['ok'=>false,'error'=>'Database connection configuration is invalid.']); }
 parse_str($p['query'] ?? '',$q); $sslmode=$q['sslmode'] ?? (getenv('PGSSLMODE') ?: 'require');
 $dsn='pgsql:host='.$p['host'].';port='.(int)($p['port'] ?? 5432).';dbname='.ltrim($p['path'],'/').';sslmode='.preg_replace('/[^a-zA-Z0-9_-]/','',(string)$sslmode);
 try { $pdo=new PDO($dsn,rawurldecode($p['user'] ?? ''),rawurldecode($p['pass'] ?? ''),[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_TIMEOUT=>10]); return $pdo; }
 catch(Throwable $e) { error_log('[Bastion database] '.$e->getMessage()); jsonResponse(503,['ok'=>false,'error'=>'Could not connect to database. Check DATABASE_URL and Supabase network settings.']); }
}
function b64e(string $s): string { return rtrim(strtr(base64_encode($s),'+/','-_'),'='); }
function b64d(string $s): string|false { if (strlen($s)%4) $s.=str_repeat('=',4-strlen($s)%4); return base64_decode(strtr($s,'-_','+/'),true); }
function jwtSecret(): string { $s=getenv('JWT_SECRET') ?: ''; if (strlen($s)<32) { error_log('[Bastion] JWT_SECRET too short/missing'); jsonResponse(500,['ok'=>false,'error'=>'Session security is not configured.']); } return $s; }
function setSession(array $u): void { $now=time(); $h=b64e(json_encode(['alg'=>'HS256','typ'=>'JWT'])); $p=b64e(json_encode(['iss'=>'bastion-arena','sub'=>(string)$u['id'],'username'=>(string)$u['username'],'iat'=>$now,'exp'=>$now+604800])); $v=$h.'.'.$p; $token=$v.'.'.b64e(hash_hmac('sha256',$v,jwtSecret(),true)); setcookie('bastion_session',$token,['expires'=>$now+604800,'path'=>'/','secure'=>((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')==='https')),'httponly'=>true,'samesite'=>'Lax']); }
function clearSession(): void { setcookie('bastion_session','',['expires'=>time()-3600,'path'=>'/','secure'=>((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')==='https')),'httponly'=>true,'samesite'=>'Lax']); }
function currentUser(): ?array { $t=$_COOKIE['bastion_session'] ?? ''; $a=explode('.',$t); if (count($a)!==3) return null; [$h,$p,$s]=$a; $hj=b64d($h); $pj=b64d($p); $sig=b64d($s); if ($hj===false||$pj===false||$sig===false) return null; $head=json_decode($hj,true); $data=json_decode($pj,true); if (!is_array($head)||($head['alg']??'')!=='HS256'||!is_array($data)) return null; if (!hash_equals(hash_hmac('sha256',$h.'.'.$p,jwtSecret(),true),$sig)) return null; if (($data['iss']??'')!=='bastion-arena'||(int)($data['exp']??0)<time()||!isset($data['sub'],$data['username'])||!ctype_digit((string)$data['sub'])) return null; return ['id'=>(string)$data['sub'],'username'=>(string)$data['username']]; }
function requireUser(): array { $u=currentUser(); if (!$u) jsonResponse(401,['ok'=>false,'error'=>'Please sign in first.']); return $u; }
function clampInt(mixed $v,int $min,int $max,int $fallback=0): int { return is_numeric($v) ? max($min,min($max,(int)$v)) : $fallback; }
