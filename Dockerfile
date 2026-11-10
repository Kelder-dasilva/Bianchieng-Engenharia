FROM nginx:stable-alpine
RUN mkdir -p /var/log/nginx/site
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
# Arquivos de infraestrutura não ficam públicos
RUN cd /usr/share/nginx/html && rm -rf Dockerfile nginx.conf docker-compose.prod.yml deploy.sh deploy README.md \
    && chmod -R a+rX /usr/share/nginx/html && chmod 644 /etc/nginx/conf.d/default.conf
EXPOSE 80
