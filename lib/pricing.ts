import {packages} from './data';
export type MealKey='breakfast'|'lunch'|'dinner';
export const mealNames:Record<MealKey,string>={breakfast:'Kahvaltı',lunch:'Öğle yemeği',dinner:'Akşam yemeği'};
// Illustrative, configurable meal rates in TRY. Complete default combinations
// match Zepe's published package starting prices. Partial combinations are estimates.
export const pricing:Record<string,{rates:Record<MealKey,number>;allowed:MealKey[];defaults:MealKey[];min:number;max:number;snacks:number;maxSnacks:number;drinkCount:number;drinkPrice:number;days:number[]}>= {
'dengeli-beslenme':{rates:{breakfast:250,lunch:350,dinner:350},allowed:['breakfast','lunch','dinner'],defaults:['breakfast','lunch','dinner'],min:1,max:3,snacks:2,maxSnacks:2,drinkCount:0,drinkPrice:0,days:[1,3,5,15,30]},
'yuksek-protein':{rates:{breakfast:250,lunch:350,dinner:350},allowed:['breakfast','lunch','dinner'],defaults:['breakfast','lunch','dinner'],min:1,max:3,snacks:2,maxSnacks:2,drinkCount:0,drinkPrice:0,days:[1,3,5,15,30]},
'tek-ogun':{rates:{breakfast:0,lunch:400,dinner:400},allowed:['lunch','dinner'],defaults:['lunch'],min:1,max:1,snacks:1,maxSnacks:1,drinkCount:0,drinkPrice:0,days:[1,3,5,15,30]},
'aralikli-oruc':{rates:{breakfast:450,lunch:450,dinner:450},allowed:['breakfast','lunch','dinner'],defaults:['lunch','dinner'],min:2,max:2,snacks:2,maxSnacks:2,drinkCount:0,drinkPrice:0,days:[1,3,5,15,30]},
'detoks':{rates:{breakfast:0,lunch:0,dinner:0},allowed:[],defaults:[],min:0,max:0,snacks:0,maxSnacks:0,drinkCount:6,drinkPrice:175,days:[1,3,5]},
'kati-sivi-detoks':{rates:{breakfast:0,lunch:450,dinner:450},allowed:['lunch','dinner'],defaults:['lunch'],min:1,max:1,snacks:0,maxSnacks:0,drinkCount:4,drinkPrice:175,days:[3,5]}
};
// `snacks` remains accepted for existing drafts. Included quantities belong to
// the package and cannot be removed from a new quote.
export type QuoteSelection={packageId:string;days:number;people:number;selectedMeals?:MealKey[];snacks?:number};
export function selectionsValid(item:QuoteSelection){const cfg=pricing[item.packageId];if(!cfg||!cfg.days.includes(item.days))return false;const meals=item.selectedMeals??cfg.defaults;const snacks=item.snacks??cfg.snacks;return meals.length>=cfg.min&&meals.length<=cfg.max&&new Set(meals).size===meals.length&&meals.every(m=>cfg.allowed.includes(m))&&Number.isInteger(snacks)&&snacks>=0&&snacks<=cfg.maxSnacks&&Number.isInteger(item.people)&&item.people>=1&&item.people<=10;}
export function quote(item:QuoteSelection){const cfg=pricing[item.packageId];if(!cfg)throw new Error('Paket bulunamadı.');const meals=item.selectedMeals??cfg.defaults;const snacks=cfg.snacks;const daily=meals.reduce((s,m)=>s+cfg.rates[m],0)+snacks*50+cfg.drinkCount*cfg.drinkPrice;return{daily,total:daily*item.days*item.people,mainMeals:meals.length,totalMainMeals:meals.length*item.days*item.people,drinks:cfg.drinkCount,snacks,baseline:packages.find(p=>p.id===item.packageId)!.price};}
export function mealSummary(item:QuoteSelection){const cfg=pricing[item.packageId];const names=(item.selectedMeals??cfg.defaults).map(m=>mealNames[m]);if(cfg.snacks)names.push(`${cfg.snacks} ara öğün`);if(cfg.drinkCount)names.push(`${cfg.drinkCount} detoks içeceği`);return names.join(' + ')}
