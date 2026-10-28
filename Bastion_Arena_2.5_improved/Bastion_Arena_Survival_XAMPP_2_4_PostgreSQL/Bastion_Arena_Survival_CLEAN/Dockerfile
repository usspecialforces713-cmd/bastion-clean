FROM php:8.3-apache
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev \
 && docker-php-ext-install pdo_pgsql \
 && a2enmod rewrite expires \
 && sed -ri "s/AllowOverride None/AllowOverride All/g" /etc/apache2/apache2.conf \
 && rm -rf /var/lib/apt/lists/*
# Render gives the port in $PORT (defaults to 80 locally)
RUN sed -ri "s/Listen 80/Listen \${PORT}/" /etc/apache2/ports.conf \
 && sed -ri "s/:80>/:\${PORT}>/" /etc/apache2/sites-available/000-default.conf
ENV PORT=80
WORKDIR /var/www/html
COPY . /var/www/html/
RUN rm -rf bastion_render_php_migration lib package.json vercel.json && chown -R www-data:www-data /var/www/html
EXPOSE 80
