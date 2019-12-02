import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
// import { CustomValidators } from '../../app.constants';

@Injectable({
  providedIn: 'root'
})
export class CreateFormUtilityService {

  constructor() { }

  setValueOfForm(formTags, controlName, value) {

    // setTimeout(() => { formTags[this.findIndexOfFormControl(formTags, controlName)].value = value; }, 0);
    formTags[this.findIndexOfFormControl(formTags, controlName)].value = value;
    console.log("setting value to form ", formTags, " control name ", controlName, " value ", value)
  }

  setItemsArray(formTags, controlName, itemsArray) {
    for (let i = 0; i < formTags.length; i++) {
      if (formTags[i].formControlName == controlName) {
        formTags[i].itemsArray = itemsArray;
        break;
      }
    }
  }


  addControlInForm(formTags, addTagObjectOrList, index): any[] {
    let tempFormTags = this.deepClone(formTags);
    console.log("check ", addTagObjectOrList);

    if (addTagObjectOrList.length) {
      for (let i = 0; i < addTagObjectOrList.length; i++) {
        tempFormTags.splice(index + 1 + i, 0, addTagObjectOrList[i]);
      }
    }
    else
      tempFormTags.splice(index, 0, addTagObjectOrList); // change index+1 => index testing 

    return tempFormTags;
  }

  removeControlInForm(formTags, controlName, count) {
    let tempFormTags = this.deepClone(formTags);
    let removeTagIndex = this.findIndexOfFormControl(formTags, controlName);
    tempFormTags.splice(removeTagIndex, count);
    return tempFormTags;
  }


  modifyFormControlValidatorsArray(formTags, controlName, validatorsArray) {
    let tempFormTags = this.deepClone(formTags);
    let index = this.findIndexOfFormControl(formTags, controlName);
    tempFormTags[index].validatorsArray = validatorsArray;
    //formTags = tempFormTags;
    return tempFormTags;
  }


  findIndexOfFormControl(formTags, controlName): number {
    return formTags.findIndex(tag => tag.formControlName == controlName);
  }

  deepClone(obj, hash = new WeakMap()) {
    // Do not try to clone primitives or functions
    if (Object(obj) !== obj || obj instanceof Function) return obj;
    if (hash.has(obj)) return hash.get(obj); // Cyclic reference
    try { // Try to run constructor (without arguments, as we don't know them)
      var result = new obj.constructor();
    } catch (e) { // Constructor failed, create object without running the constructor
      result = Object.create(Object.getPrototypeOf(obj));
    }
    // Optional: support for some standard constructors (extend as desired)
    if (obj instanceof Map)
      Array.from(obj, ([key, val]) => result.set(this.deepClone(key, hash),
        this.deepClone(val, hash)));
    else if (obj instanceof Set)
      Array.from(obj, (key) => result.add(this.deepClone(key, hash)));
    // Register in hash    
    hash.set(obj, result);
    // Clone and assign enumerable own properties recursively
    return Object.assign(result, ...Object.keys(obj).map(
      key => ({ [key]: this.deepClone(obj[key], hash) })));
  }
}
