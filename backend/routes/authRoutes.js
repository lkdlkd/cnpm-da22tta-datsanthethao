const express = require('express');
const { doiMatKhau,register, login,deleteUser,updateUser,getUsers ,capNhatThongTinCaNhan} = require('../controllers/UserControllers');
const sanBongController = require('../controllers/SanbongControllers');
const datSanController = require('../controllers/DatSanControllers');
const { authenticate, authorizeAdmin} = require('../middlewares/authMiddleware');

const router = express.Router();

// Endpoint đăng ký
router.post('/auth/register', register);
// Endpoint đăng nhập
router.post('/auth/login', login);
// Endpoint San Bóng
router.get('/danhsachsan',authenticate, sanBongController.layDanhSachSan);
router.get('/sanbong/:id', authenticate, sanBongController.laySanTheoId);
// Endpoint đặt sân
router.post('/datsan', authenticate, datSanController.datSan);
router.get('/danhsachdadat', authenticate, datSanController.getDatSanByUserId);

// Endpoint ADMIN 
// Endpoint quản lý sân bóng
router.post('/addsan', authenticate,authorizeAdmin, sanBongController.themSan);
router.put('/suasan/:id',authenticate,authorizeAdmin, sanBongController.suaSan);
router.delete('/xoasan/:id',authenticate,authorizeAdmin, sanBongController.xoaSan);
router.put('/:id/xacnhandatsan', authenticate,authorizeAdmin, datSanController.adminXacNhanDatSan);
// Endpoint quản lý user
// Route xóa người dùng
router.delete("/xoauser/:id",authenticate,authorizeAdmin, deleteUser);
// Route sửa thông tin người dùng
router.put("/updateuser/:id", authenticate,authorizeAdmin, updateUser);
router.get('/user', authenticate ,getUsers);
router.put('/cap-nhat-thong-tin', authenticate, capNhatThongTinCaNhan);
router.put("/doi-mat-khau", authenticate, doiMatKhau);

module.exports = router;