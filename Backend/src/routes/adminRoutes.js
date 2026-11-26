const express=require('express'), crypto=require('node:crypto');
const {layPool,sql}=require('../config/database');
const {schemas,parse,invalid}=require('../admin/csv');
const router=express.Router();
router.use(require('../middleware/xacThuc'),require('../middleware/phanQuyen')('ADMIN'));
router.use(express.json({limit:'1mb'}));
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
router.get('/mau/:loai',(req,res)=>{
  if(!Object.hasOwn(schemas,req.params.loai)) return res.sendStatus(404);
  res.type('text/csv').send(schemas[req.params.loai].join('\n')+'\n');
});
for(const action of ['xem-truoc','luu']) router.post('/du-lieu/'+action,wrap(async(req,res)=>{
  const {loai,tenFile,csv}=req.body||{};
  if(typeof tenFile!=='string'||tenFile.length>150||!/^([^/\\\x00-\x1f]+)\.csv$/i.test(tenFile)) invalid('Chọn file .csv hợp lệ.');
  const data=parse(loai,csv);
  if(action==='xem-truoc') return res.json({cols:data.cols,mau:data.mau,soDong:data.soDong});
  await layPool().request().input('loai',sql.VarChar(20),loai).input('ten',sql.NVarChar(150),tenFile).input('n',sql.Int,data.soDong).input('hash',sql.Char(64),crypto.createHash('sha256').update(data.csv).digest('hex')).input('csv',sql.VarChar(sql.MAX),data.csv).input('id',sql.Int,req.taiKhoan.idTaiKhoan).query(`INSERT INTO BO_DU_LIEU_TRAIN(LOAI,TEN_FILE,SO_DONG,MA_BAM,NOI_DUNG,NGUOI_NHAP) VALUES(@loai,@ten,@n,@hash,@csv,@id)`);
  res.status(201).json({soDong:data.soDong});
}));
router.get('/du-lieu',wrap(async(req,res)=>res.json((await layPool().request().query(`SELECT TOP(100) b.ID_BO,b.LOAI,b.TEN_FILE,b.SO_DONG,b.NGAY_NHAP,t.MA_DANG_NHAP FROM BO_DU_LIEU_TRAIN b JOIN TAI_KHOAN t ON t.ID_TAI_KHOAN=b.NGUOI_NHAP ORDER BY b.ID_BO DESC`)).recordset)));
router.get('/du-lieu/:id',wrap(async(req,res)=>{
  const id=Number(req.params.id); if(!Number.isInteger(id)||id<1||id>2147483647) invalid('Mã bộ dữ liệu không hợp lệ.');
  const r=await layPool().request().input('id',sql.Int,id).query('SELECT NOI_DUNG FROM BO_DU_LIEU_TRAIN WHERE ID_BO=@id');
  if(!r.recordset.length) return res.sendStatus(404);
  res.attachment(`dataset-${id}.csv`).send(r.recordset[0].NOI_DUNG);
}));
router.use((err,req,res,next)=>{
  if([2601,2627].includes(err.number)) return res.status(409).json({thongBao:'Mã tài khoản hoặc bộ dữ liệu đã tồn tại.'});
  if(err.status===400||err.status===413) return res.status(err.status).json({thongBao:err.type?'Nội dung yêu cầu không hợp lệ hoặc quá lớn.':err.message});
  console.error('Admin API:',err.code || err.name); res.status(500).json({thongBao:'Không thực hiện được thao tác.'});
});
module.exports=router;
