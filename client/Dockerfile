FROM node:18

# Tạo thư mục app
WORKDIR /app

# Copy package.json và cài đặt
COPY package*.json ./
RUN npm install

# Copy toàn bộ code
COPY . .

# Build production (nếu cần build)
# RUN npm run build

# Mở cổng
EXPOSE 3000

# Chạy client (phát triển)
CMD ["npm", "start"]
