FROM node:18

WORKDIR /app

# Chỉ copy package.json để cài đặt, KHÔNG copy node_modules
COPY package*.json ./
RUN npm install

# Sau đó mới copy source code vào
COPY . .

EXPOSE 5000
CMD ["node", "app.js"]
