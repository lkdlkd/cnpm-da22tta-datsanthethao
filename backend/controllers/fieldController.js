const Field = require('../models/Field');
const fs = require('fs');
const path = require('path');

// Lấy danh sách tất cả sân (có phân trang)
exports.getAllFields = async (req, res) => {
    try {
        const { fieldType, status, minPrice, maxPrice, location, search, page , limit  } = req.query;
        
        let query = {};
        
        if (fieldType) query.fieldType = fieldType;
        if (status) query.status = status;
        if (location) query.location = { $regex: location, $options: 'i' };
        
        // Tìm kiếm theo tên sân, địa điểm, địa chỉ
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (minPrice || maxPrice) {
            query.pricePerHour = {};
            if (minPrice) query.pricePerHour.$gte = Number(minPrice);
            if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
        }

        // Tính toán phân trang
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Lấy tổng số sân
        const total = await Field.countDocuments(query);

        // Lấy dữ liệu với phân trang
        const fields = await Field.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({ 
            data: fields,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Lấy thông tin chi tiết một sân
exports.getFieldById = async (req, res) => {
    try {
        const field = await Field.findById(req.params.id);
        if (!field) {
            return res.status(404).json({ message: 'Không tìm thấy sân' });
        }
        res.json({ data: field });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Tạo sân mới (Admin)
exports.createField = async (req, res) => {
    try {
        const field = new Field(req.body);
        await field.save();
        res.status(201).json({ message: 'Tạo sân thành công', data: field });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Cập nhật thông tin sân (Admin)
exports.updateField = async (req, res) => {
    try {
        const field = await Field.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!field) {
            return res.status(404).json({ message: 'Không tìm thấy sân' });
        }
        
        res.json({ message: 'Cập nhật thành công', data: field });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Xóa sân (Admin)
exports.deleteField = async (req, res) => {
    try {
        const field = await Field.findByIdAndDelete(req.params.id);
        if (!field) {
            return res.status(404).json({ message: 'Không tìm thấy sân' });
        }
        res.json({ message: 'Xóa sân thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Lấy sân phổ biến (theo rating)
exports.getPopularFields = async (req, res) => {
    try {
        const fields = await Field.find({ status: 'active' })
            .sort({ rating: -1, totalReviews: -1 })
            .limit(6);
        res.json({ data: fields });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Upload hình ảnh cho sân
exports.uploadFieldImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Không có file nào được upload' });
        }

        const fieldId = req.params.id;
        const field = await Field.findById(fieldId);
        
        if (!field) {
            // Xóa các file đã upload nếu không tìm thấy sân
            req.files.forEach(file => {
                fs.unlinkSync(file.path);
            });
            return res.status(404).json({ message: 'Không tìm thấy sân' });
        }

        // Tạo URLs cho các ảnh đã upload
        const imageUrls = req.files.map(file => {
            return `/uploads/fields/${file.filename}`;
        });

        // Thêm URLs vào mảng images của sân
        field.images = [...(field.images || []), ...imageUrls];
        await field.save();

        res.json({ 
            message: 'Upload ảnh thành công', 
            data: field,
            uploadedImages: imageUrls 
        });
    } catch (error) {
        // Xóa các file đã upload nếu có lỗi
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        res.status(500).json({ message: 'Lỗi khi upload ảnh', error: error.message });
    }
};

// Xóa hình ảnh của sân
exports.deleteFieldImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({ message: 'imageUrl là bắt buộc' });
        }
        
        const field = await Field.findById(id);
        
        if (!field) {
            return res.status(404).json({ message: 'Không tìm thấy sân' });
        }

        // Xóa URL khỏi mảng images
        const imageIndex = field.images.indexOf(imageUrl);
        if (imageIndex === -1) {
            return res.status(404).json({ message: 'Không tìm thấy hình ảnh' });
        }

        field.images.splice(imageIndex, 1);
        await field.save();

        // Xóa file vật lý nếu là local file
        if (imageUrl.startsWith('/uploads')) {
            const filename = path.basename(imageUrl);
            const filePath = path.join(__dirname, '../uploads/fields', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.json({ message: 'Xóa ảnh thành công', data: field });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa ảnh', error: error.message });
    }
};

// Cập nhật thứ tự hình ảnh
exports.updateFieldImagesOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { images } = req.body;

        if (!Array.isArray(images)) {
            return res.status(400).json({ message: 'Images phải là một mảng' });
        }

        const field = await Field.findById(id);
        if (!field) {
            return res.status(404).json({ message: 'Không tìm thấy sân' });
        }

        field.images = images;
        await field.save();

        res.json({ message: 'Cập nhật thứ tự ảnh thành công', data: field });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật thứ tự ảnh', error: error.message });
    }
};

// Seed 10 sân mẫu (dùng cho testing/development)
exports.seedFields = async (req, res) => {
    try {
        const sampleFields = [
            {
                name: 'Sân Bóng Thành Công',
                fieldType: '5vs5',
                address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
                location: 'Quận 1',
                pricePerHour: 300000,
                description: 'Sân bóng đá 5 người chất lượng cao với cỏ nhân tạo mới nhất. Đầy đủ tiện nghi, có căng tin, chỗ để xe rộng rãi.',
                amenities: ['Có mái che', 'Đèn chiếu sáng', 'Căng tin', 'WiFi', 'Phòng thay đồ'],
                status: 'active',
                rating: 4.8,
                totalReviews: 125,
                images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800']
            },
            {
                name: 'Sân Bóng Phú Nhuận',
                fieldType: '7vs7',
                address: '456 Phan Xích Long, Phú Nhuận, TP.HCM',
                location: 'Phú Nhuận',
                pricePerHour: 500000,
                description: 'Sân bóng 7 người tiêu chuẩn FIFA. Cỏ tự nhiên được chăm sóc kỹ lưỡng, hệ thống tưới tự động.',
                amenities: ['Cỏ tự nhiên', 'Đèn chiếu sáng', 'Camera an ninh', 'Bãi đậu xe', 'Phòng VIP'],
                status: 'active',
                rating: 4.9,
                totalReviews: 98,
                images: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800']
            },
            {
                name: 'Sân Bóng Thể Thao Tân Bình',
                fieldType: '11vs11',
                address: '789 Cộng Hòa, Tân Bình, TP.HCM',
                location: 'Tân Bình',
                pricePerHour: 1200000,
                description: 'Sân bóng 11 người tiêu chuẩn thi đấu chuyên nghiệp. Phù hợp tổ chức giải đấu và các trận giao hữu lớn.',
                amenities: ['Sân tiêu chuẩn', 'Khán đài 500 chỗ', 'Phòng thay đồ VIP', 'Căng tin lớn', 'Bãi xe rộng'],
                status: 'active',
                rating: 5.0,
                totalReviews: 67,
                images: ['https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800']
            },
            {
                name: 'Sân Mini Bình Thạnh',
                fieldType: '5vs5',
                address: '321 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM',
                location: 'Bình Thạnh',
                pricePerHour: 250000,
                description: 'Sân mini giá rẻ phù hợp sinh viên và công nhân viên. Chất lượng tốt, giá cả hợp lý.',
                amenities: ['Cỏ nhân tạo', 'Đèn chiếu sáng', 'Nước uống miễn phí', 'Chỗ để xe'],
                status: 'active',
                rating: 4.3,
                totalReviews: 156,
                images: ['https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800']
            },
            {
                name: 'Sân Bóng Gò Vấp Sports',
                fieldType: '7vs7',
                address: '555 Quang Trung, Gò Vấp, TP.HCM',
                location: 'Gò Vấp',
                pricePerHour: 450000,
                description: 'Sân bóng hiện đại với hệ thống đèn LED tiết kiệm năng lượng. Mặt sân phẳng, thoát nước tốt.',
                amenities: ['Cỏ nhân tạo cao cấp', 'Đèn LED', 'Phòng tắm', 'Tủ đồ', 'Căng tin'],
                status: 'active',
                rating: 4.6,
                totalReviews: 89,
                images: ['https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800']
            },
            {
                name: 'Sân Bóng Quận 3',
                fieldType: '5vs5',
                address: '88 Võ Văn Tần, Quận 3, TP.HCM',
                location: 'Quận 3',
                pricePerHour: 350000,
                description: 'Sân bóng ngay trung tâm quận 3, giao thông thuận tiện. Có mái che toàn bộ, chơi được cả trời mưa.',
                amenities: ['Mái che toàn phần', 'Đèn chiếu sáng', 'Camera', 'Căng tin', 'Bảo vệ 24/7'],
                status: 'active',
                rating: 4.7,
                totalReviews: 143,
                images: ['https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800']
            },
            {
                name: 'Sân Bóng Thủ Đức',
                fieldType: '7vs7',
                address: '999 Võ Văn Ngân, Thủ Đức, TP.HCM',
                location: 'Thủ Đức',
                pricePerHour: 400000,
                description: 'Sân bóng mới khai trương tại khu đô thị mới Thủ Đức. Trang thiết bị hiện đại, không gian thoáng mát.',
                amenities: ['Cỏ nhân tạo mới', 'Hệ thống âm thanh', 'Bảng điện tử', 'Phòng thay đồ', 'Quán cafe'],
                status: 'active',
                rating: 4.5,
                totalReviews: 72,
                images: ['https://images.unsplash.com/photo-1600077106724-946750eeaf3c?w=800']
            },
            {
                name: 'Sân Bóng Đa Năng Quận 7',
                fieldType: '5vs5',
                address: '147 Nguyễn Văn Linh, Quận 7, TP.HCM',
                location: 'Quận 7',
                pricePerHour: 380000,
                description: 'Sân đa năng có thể chơi bóng đá, bóng chuyền. Nằm trong khu thể thao hiện đại với nhiều tiện ích.',
                amenities: ['Sân đa năng', 'Phòng gym', 'Hồ bơi', 'Spa', 'Nhà hàng'],
                status: 'active',
                rating: 4.8,
                totalReviews: 110,
                images: ['https://images.unsplash.com/photo-1473976345543-9ffc928e648f?w=800']
            },
            {
                name: 'Sân Bóng Sài Gòn Center',
                fieldType: '11vs11',
                address: '222 Lê Duẩn, Quận 1, TP.HCM',
                location: 'Quận 1',
                pricePerHour: 1500000,
                description: 'Sân bóng tiêu chuẩn quốc tế ngay trung tâm thành phố. Phù hợp tổ chức các sự kiện thể thao lớn.',
                amenities: ['Sân cỏ tự nhiên', 'Khán đài 1000 chỗ', 'Phòng họp báo', 'Phòng VIP', 'Bãi xe 200 xe'],
                status: 'active',
                rating: 5.0,
                totalReviews: 45,
                images: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800']
            },
            {
                name: 'Sân Bóng Nhân Dân',
                fieldType: '7vs7',
                address: '369 Lý Thường Kiệt, Quận 10, TP.HCM',
                location: 'Quận 10',
                pricePerHour: 420000,
                description: 'Sân bóng truyền thống được nâng cấp hiện đại. Phục vụ cộng đồng với giá cả phải chăng.',
                amenities: ['Cỏ nhân tạo', 'Đèn chiếu sáng tốt', 'Căng tin giá rẻ', 'Chỗ để xe miễn phí', 'Cho thuê trang phục'],
                status: 'active',
                rating: 4.4,
                totalReviews: 187,
                images: ['https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800']
            }
        ];

        // Xóa các sân cũ (nếu có)
        // await Field.deleteMany({});

        // Thêm 10 sân mới
        const createdFields = await Field.insertMany(sampleFields);

        res.status(201).json({ 
            message: `Đã tạo thành công ${createdFields.length} sân bóng`, 
            data: createdFields 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Lỗi khi tạo sân mẫu', 
            error: error.message 
        });
    }
};
