(() => {
  const section=document.getElementById('heroMotionControls');if(!section)return;
  const frame=document.getElementById('heroMotionPreview');
  function update(){
    const settings={};section.querySelectorAll('[name]').forEach(el=>settings[el.name]=el.type==='range'||el.type==='number'?Number(el.value):el.value);
    section.querySelectorAll('input[type="range"]').forEach(el=>{const output=section.querySelector(`[data-motion-output="${el.name}"]`);if(output)output.textContent=el.value+(el.dataset.unit||'')});
    if(!frame.hidden)frame.contentWindow?.postMessage({type:'caressano-motion-preview',settings},location.origin);
  }
  section.addEventListener('input',update);section.addEventListener('change',update);
  frame.addEventListener('load',update);
  document.getElementById('showHeroMotionPreview').addEventListener('click',()=>{
    frame.hidden=!frame.hidden;
    if(!frame.hidden&&!frame.getAttribute('src'))frame.src='index.html?caressanoMotionPreview=1';
    update();
  });
  section.querySelector('[data-reset-visual-section]').addEventListener('click',()=>setTimeout(update,0));
  // Existing loadVisual fills the fields after login and after restoring sections.
  const original=loadVisual;
  loadVisual=async function(){await original();update()};
})();
