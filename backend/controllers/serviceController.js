const Service = require('../models/Service');

// Lấy danh sách dịch vụ (có phân trang và tìm kiếm)
exports.getAllServices = async (req, res) => {
    try {
        const { category, isAvailable, search, page = 1, limit = 10 } = req.query;
        let query = {};

        if (category) query.category = category;
        if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
        
        // Tìm kiếm theo tên hoặc mô tả
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Tính toán phân trang
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const total = await Service.countDocuments(query);

        const services = await Service.find(query)
            .sort({ category: 1, name: 1 })
            .skip(skip)
            .limit(limitNum);
        
        res.json({
            data: services,
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

// Lấy chi tiết dịch vụ
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
        }
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Tạo dịch vụ mới (Admin)
exports.createService = async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(201).json({ message: 'Tạo dịch vụ thành công', service });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Cập nhật dịch vụ (Admin)
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
        }

        res.json({ message: 'Cập nhật thành công', service });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Xóa dịch vụ (Admin)
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
        }
        res.json({ message: 'Xóa dịch vụ thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Cập nhật số lượng tồn kho
exports.updateStock = async (req, res) => {
    try {
        const { quantity, action } = req.body; // action: 'add' or 'subtract'
        const service = await Service.findById(req.params.id);
        
        if (!service) {
            return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
        }

        if (action === 'add') {
            service.stock += quantity;
        } else if (action === 'subtract') {
            if (service.stock < quantity) {
                return res.status(400).json({ message: 'Số lượng không đủ' });
            }
            service.stock -= quantity;
        }

        await service.save();
        res.json({ message: 'Cập nhật tồn kho thành công', service });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Lấy dịch vụ theo danh mục
exports.getServicesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const services = await Service.find({ 
            category, 
            isAvailable: true,
            stock: { $gt: 0 }
        }).sort({ name: 1 });
        
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Thống kê dịch vụ
exports.getServicesStats = async (req, res) => {
    try {
        const total = await Service.countDocuments();
        const available = await Service.countDocuments({ isAvailable: true });
        const outOfStock = await Service.countDocuments({ stock: 0 });
        
        const byCategory = await Service.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalStock: { $sum: '$stock' },
                    avgPrice: { $avg: '$price' }
                }
            }
        ]);

        res.json({
            total,
            available,
            outOfStock,
            byCategory
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Kiểm tra tình trạng dịch vụ
exports.checkAvailability = async (req, res) => {
    try {
        const { serviceId, quantity } = req.query;
        const service = await Service.findById(serviceId);
        
        if (!service) {
            return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
        }

        const isAvailable = service.isAvailable && service.stock >= parseInt(quantity);
        
        res.json({
            isAvailable,
            service: {
                name: service.name,
                price: service.price,
                stock: service.stock,
                unit: service.unit
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
