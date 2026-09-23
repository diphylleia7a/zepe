import assert from 'node:assert/strict';
import test from 'node:test';
import {build} from 'esbuild';
const result=await build({entryPoints:['lib/model.ts'],bundle:true,platform:'node',format:'esm',write:false});
const model=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
const rates=await build({entryPoints:['lib/pricing.ts'],bundle:true,platform:'node',format:'esm',write:false});
const pricing=await import('data:text/javascript;base64,'+Buffer.from(rates.outputFiles[0].text).toString('base64'));
const selection={packageId:'dengeli-beslenme',days:5,people:1,selectedMeals:['breakfast','lunch','dinner'],snacks:2};
test('meal choices change the quote saved by the server',()=>{assert.equal(pricing.quote(selection).total,5250);assert.equal(pricing.quote({...selection,selectedMeals:['lunch','dinner']}).total,4000);assert.equal(pricing.quote({...selection,people:2}).total,10500);const item={...selection,id:'test',startDate:'2026-10-01',mealOption:'Test',notes:''};assert.ok(model.cartItemSchema.safeParse(item).success);assert.equal(model.cartTotal([item]),5250);assert.equal(model.cartItemSchema.safeParse({...item,price:1}).success,false);});
test('incompatible subscriptions and duplicate meals cannot be saved',()=>{assert.equal(pricing.selectionsValid({...selection,selectedMeals:[]}),false);assert.equal(pricing.selectionsValid({...selection,selectedMeals:['lunch','lunch']}),false);assert.equal(pricing.selectionsValid({...selection,packageId:'tek-ogun'}),false);assert.equal(model.patchSchema.safeParse({orders:[]}).success,false);});
test('included snacks stay in the quote and summary for every package',()=>{
  for(const [packageId,cfg] of Object.entries(pricing.pricing)){
    const item={packageId,days:cfg.days[0],people:2,snacks:0};
    const result=pricing.quote(item);
    assert.equal(result.daily,result.baseline,packageId);
    assert.equal(result.total,result.baseline*item.days*2,packageId);
    assert.equal(result.snacks,cfg.snacks,packageId);
    if(cfg.snacks)assert.ok(pricing.mealSummary(item).includes(`${cfg.snacks} ara öğün`),packageId);
  }
  const legacy={...selection,snacks:0,id:'legacy',startDate:'2026-10-01',mealOption:'Önceki seçim',notes:''};
  assert.ok(model.cartItemSchema.safeParse(legacy).success);
  assert.equal(model.cartTotal([legacy]),5250);
});
test('detox drinks are included while the chosen main meal and duration remain valid',()=>{
  const liquid={packageId:'detoks',days:3,people:2,selectedMeals:[]};
  assert.ok(pricing.selectionsValid(liquid));
  assert.equal(pricing.quote(liquid).drinks,6);
  assert.equal(pricing.quote(liquid).total,6300);
  assert.equal(pricing.mealSummary(liquid),'6 detoks içeceği');
  const mixed={packageId:'kati-sivi-detoks',days:5,people:1,selectedMeals:['dinner']};
  assert.ok(pricing.selectionsValid(mixed));
  assert.equal(pricing.quote(mixed).drinks,4);
  assert.equal(pricing.quote(mixed).total,5750);
  assert.equal(pricing.selectionsValid({...mixed,days:30}),false);
  assert.equal(pricing.selectionsValid({...mixed,selectedMeals:['breakfast']}),false);
});
test('dietary exclusions are respected and family groceries scale',()=>{const p={...model.initialProfile,diet:'vegan',allergens:['Süt','Gluten','Soya']};const plan=model.createPlan(p);const allowed=new Set(model.eligible(p).map(r=>r.id));assert.equal(plan.days.length,7);assert.ok(plan.days.flat().every(m=>allowed.has(m.recipeId)));const one=model.shopping(plan),two=model.shopping(plan,2);assert.ok(one.every((i,k)=>Math.abs(two[k].amount-i.amount*2)<.00001));assert.throws(()=>model.createPlan({...p,exclusions:'chia'}));});
