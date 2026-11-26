const schemas = {
  hoc_phan: ['ma_hoc_phan;so_tin_chi;diem_chuyen_can;diem_thuong_xuyen;ty_le_hoan_thanh_bai_tap;so_buoi_nghi;diem_hoc_phan_thuc_te','INT2207;4;8.9;5.1;86.8;4;5.8'],
  gpa_ky: ['gpa_ky_gan_nhat,gpa_trung_binh_lich_su,xu_huong_gpa,so_hoc_ky_da_hoc,tong_tin_chi_ky_toi,gio_tu_hoc_tuan,ty_le_chuyen_can,gio_lam_them_tuan,gpa_hoc_ky_tiep_theo','2.71,2.45,0.0665,7,19,20,89,1,2.76'],
  tot_nghiep: ['gpa_ky_gan_nhat,gpa_trung_binh_lich_su,xu_huong_gpa,so_hoc_ky_da_hoc,ty_le_tin_chi_da_tich_luy,muc_do_co_gang,gpa_tot_nghiep','3.08,2.72,0.0559,8,1,1,2.53']
};
function invalid(message){throw Object.assign(new Error(message),{status:400});}
function parse(type,text){
  if(!Object.hasOwn(schemas,type)) invalid('Loại bộ dữ liệu không hợp lệ.');
  if(typeof text!=='string' || Buffer.byteLength(text)>900000) invalid('CSV phải nhỏ hơn 900 KB.');
  const [header]=schemas[type], sep=header.includes(';')?';':',';
  const lines=text.trim().split(/\r?\n/), cols=header.split(sep);
  const fields=line=>line.split(sep).map(x=>x.trim().replace(/^"([^"]*)"$/,'$1'));
  if(fields(lines[0]).join(sep)!==header) invalid('Dòng 1: tên cột, thứ tự hoặc dấu phân cách không khớp file mẫu.');
  if(lines.length<2 || lines.length>10001) invalid('CSV cần từ 1 đến 10.000 dòng dữ liệu.');
  const rows=lines.slice(1).map((line,i)=>{
    const row=fields(line);
    if(row.length!==cols.length) invalid(`Dòng ${i+2}: số cột không khớp.`);
    return row.map((v,j)=>{
      const k=cols[j], bad=()=>invalid(`Dòng ${i+2}, cột ${k}: giá trị không hợp lệ.`);
      if(k==='ma_hoc_phan'){if(!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,29}$/.test(v)) bad(); return v;}
      const n=Number(v);
      if(!/^-?\d+(\.\d+)?$/.test(v)||!Number.isFinite(n)) bad();
      if ((k==='xu_huong_gpa'?Math.abs(n)>4:n<0) || (k.startsWith('gpa_') && n>4) || (k.startsWith('diem_') && n>10) || (k.startsWith('ty_le_') && n>(k==='ty_le_tin_chi_da_tich_luy'?1:100)) || (/^(so_|tong_tin_chi)/.test(k) && (!Number.isSafeInteger(n) || (k!=='so_buoi_nghi' && !n)))) bad();
      return String(n);
    });
  });
  return {cols,soDong:rows.length,mau:rows.slice(0,5),csv:[header,...rows.map(r=>r.join(sep))].join('\n')+'\n'};
}
module.exports={schemas,parse,invalid};
