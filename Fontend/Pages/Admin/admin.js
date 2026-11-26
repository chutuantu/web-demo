'use strict';
const el=id=>document.getElementById(id), stored=k=>localStorage.getItem(k)||sessionStorage.getItem(k);
const status=(id,msg)=>{el(id).textContent=msg;};
async function api(path,body){
  const headers={Authorization:'Bearer '+stored('token')};
  if(body) headers['Content-Type']='application/json';
  const r=await fetch('/api/admin/'+path,{headers,method:body?'POST':'GET',body:body?JSON.stringify(body):undefined});
  if(!r.ok) throw Error((await r.json().catch(()=>({}))).thongBao||`Không thực hiện được yêu cầu (${r.status}).`);
  return r;
}
async function download(path,name){const blob=await (await api(path)).blob(), url=URL.createObjectURL(blob), a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
let ready=null,revision=0;
function reset(){revision++;ready=null;el('save').disabled=true;el('table').replaceChildren();status('dataStatus','');}
el('file').onchange=reset;el('loai').onchange=reset;
el('sample').onclick=()=>download('mau/'+el('loai').value,el('loai').value+'.csv').catch(e=>status('dataStatus',e.message));
el('preview').onclick=async()=>{reset();const rev=revision;try{const f=el('file').files[0];if(!f||f.size>900000) throw Error('Chọn file CSV tối đa 900 KB.');const item={loai:el('loai').value,tenFile:f.name,csv:await f.text()};const d=await (await api('du-lieu/xem-truoc',item)).json();if(rev!==revision)return;const table=document.createElement('table');for(const [i,row] of [d.cols,...d.mau].entries()){const tr=table.insertRow();for(const value of row){const cell=document.createElement(i?'td':'th');cell.textContent=value;tr.append(cell);}}el('table').append(table);ready=item;el('save').disabled=false;status('dataStatus',`${d.soDong} dòng hợp lệ. Xem trước ${d.mau.length} dòng đầu.`);}catch(e){if(rev===revision)status('dataStatus',e.message);}};
el('save').onclick=async()=>{if(!ready)return;el('save').disabled=true;const item=ready;try{const d=await (await api('du-lieu/luu',item)).json();if(ready===item){reset();el('file').value='';status('dataStatus',`Đã lưu ${d.soDong} dòng.`);}await historyList();}catch(e){status('dataStatus',e.message);if(ready===item)el('save').disabled=false;}};
async function historyList(){try{const rows=await(await api('du-lieu')).json();el('history').replaceChildren();for(const r of rows){const li=document.createElement('li'),btn=document.createElement('button');btn.textContent=r.TEN_FILE;btn.onclick=()=>download('du-lieu/'+r.ID_BO,r.TEN_FILE).catch(e=>status('historyStatus',e.message));li.append(btn,` · ${r.SO_DONG} dòng · ${r.MA_DANG_NHAP} · ${new Date(r.NGAY_NHAP).toLocaleString('vi-VN')}`);el('history').append(li);}status('historyStatus',rows.length?'':'Chưa có bộ dữ liệu.');}catch(e){status('historyStatus',e.message);}}
historyList();
