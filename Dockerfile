From node:argon

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# copy app's source code into workdir
COPY . /usr/src/app/

# expose port
EXPOSE 8080

# RUN /usr/src/app/init.sh
CMD ["/usr/src/app/init.sh"]
#CMD ["npm", "start"]
