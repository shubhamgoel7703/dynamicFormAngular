import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { concatAll } from 'rxjs/operators';
// import * as $ from 'jquery';
import { Jsonp } from '@angular/http';
import { SharedService } from '../../services/shared/shared.service';
import { CreateFormUtilityService } from '../../services/common/create-form-utility.service';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.css']
})
export class CreateFormComponent implements OnInit, OnChanges {

  @Input()
  formHeading;
  @Input()
  formDataList = [];
  tempFormDataList = [];
  // mandatory keys :colSize,label,tag, formControlName, validatorsArray
  @Input()
  checkValidationFlag;
  tempValidationFlag;
  @Input()
  resetFormFlag;
  tempResetFormFlag;


  @Output()
  validatedForm = new EventEmitter();
  @Output()
  throwEvent = new EventEmitter();



  formGroup: FormGroup;

  constructor(private sharedService: SharedService, private createFormUtilityService: CreateFormUtilityService) { }


  formControlChange(formControlName) {

    this.throwEvent.emit([{
      formControlName: formControlName,
      formControlValue: this.formGroup.get(formControlName).value ? this.formGroup.get(formControlName).value : undefined,
      formGroup: this.formGroup
    }])

    try {
      if (this.formDataList.find(item => item.formControlName == formControlName && item.tag == "inputUploadDoc")) {
        this.updateUploadDocumnetLabel(formControlName);
      }
    }
    catch (ex) {
      console.log("exception ", ex)
    }
  }

  async updateUploadDocumnetLabel(formControlName) {
    console.log(this.formGroup.get(formControlName).value)
    console.log(this.formDataList[1].value);

    this.createFormUtilityService.setValueOfForm(this.formDataList, formControlName, this.formGroup.get(formControlName).value.split("\\").pop());

    console.log(this.formGroup.get(formControlName).value)
    console.log(this.formDataList[1].value);
  }

  subscribeUploadDocEvent() {
    // $(".custom-file-input").on("change", function () {
    //   var fileName = $(this).val().split("\\").pop();
    //   $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    // });
  }


  resetForm() {

    this.formGroup.reset();

    for (let i = 0; i < this.formDataList.length; i++) {
      if (this.formDataList[i].tag == 'select') {
        this.formGroup.get(this.formDataList[i].formControlName).setValue('');
      }
    }

    for (let i = 0; i < this.formDataList.length; i++) {
      if (this.formDataList[i].tag == 'inputUploadDoc') {
        //$(".custom-file-input").siblings(".custom-file-label").addClass("selected").html("Choose File");
        this.createFormUtilityService.setValueOfForm(this.formDataList, this.formDataList[i].formControlName, 'Choose File');

      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {


    if (this.formGroup != undefined && this.tempValidationFlag != this.checkValidationFlag) {
      this.tempValidationFlag = this.checkValidationFlag;

      if (this.formGroup.invalid) {
        this.markFormDirty(this.formGroup);
        setTimeout(() => { this.sharedService.showError("invalid " + (this.formHeading ? this.formHeading : 'submitting') + " form"); }, 0);
      }
      else {
        this.validatedForm.emit(this.formGroup);

      }
    }

    if (this.formGroup != undefined && this.tempFormDataList != this.formDataList) {



      this.updateFormControls();
      this.reassignLastValuesToForm();

      this.tempFormDataList = this.formDataList;//Object.assign([{}], this.formDataList);
    }

    if (this.formGroup != undefined && this.tempResetFormFlag != this.resetFormFlag) {
      this.resetForm();
      this.tempResetFormFlag = this.resetFormFlag;
    }
  }



  reassignLastValuesToForm() {
    for (let i = 0; i < this.tempFormDataList.length; i++) {
      try {
        let item = this.formDataList.find(item => item.formControlName == this.tempFormDataList[i].formControlName);
        if (item) {
          item.value = this.formGroup.get(item.formControlName).value;

          if (item.tag == "dateInput" && this.formGroup.get(item.formControlName).value && this.formGroup.get(item.formControlName).value.year) {

            let year = Number(this.formGroup.get(item.formControlName).value.year);
            let month = Number(this.formGroup.get(item.formControlName).value.month);
            let day = Number(this.formGroup.get(item.formControlName).value.day);
            item.value = { year: year, month: month, day: day }
            //year + '-' + ((Number(month) < 10) ? '0' + month : month) + '-' + ((Number(day) < 10) ? '0' + day : day);
          }
          else if (item.tag == "dateInput" && this.formGroup.get(item.formControlName).value && !this.formGroup.get(item.formControlName).value.year) {
            item.value = this.formGroup.get(item.formControlName).value;
          }

        }
      }
      catch (error) {
      }
    }
  }

  ngOnInit() {

    this.formGroup = new FormGroup({});
    this.createFormControls();
    this.tempValidationFlag = this.checkValidationFlag;
    this.tempFormDataList = this.formDataList;//Object.assign([{}], this.formDataList);
    this.tempResetFormFlag = this.resetFormFlag;

    setTimeout(() => { this.subscribeUploadDocEvent(); });

  }

  createFormControls() {
    //  this.formGroup = new FormGroup({});
    for (let i = 0; i < this.formDataList.length; i++) {
      let formControlName = this.formDataList[i].formControlName;
      let formControl = new FormControl('', this.formDataList[i]['validatorsArray']);
      this.formGroup.addControl(formControlName, formControl);
      if (this.formDataList[i]['value']) {
        this.formGroup.get(formControlName).setValue(this.formDataList[i]['value']);
      }
    }

  }

  updateFormControls() {
    let formDataListFormControlNames = [];
    for (let i = 0; i < this.formDataList.length; i++) {
      formDataListFormControlNames.push(this.formDataList[i].formControlName);
    }

    let existingFormControls = [];
    Object.keys(this.formGroup.controls).forEach(controlName => {

      if (formDataListFormControlNames.includes(controlName)) {
        existingFormControls.push(controlName);

        // check if validation is changed or not if same no. of validation are coming failing so setting it to true. Fix later.
        let flag = (1 || JSON.stringify(this.formDataList[formDataListFormControlNames.indexOf(controlName)]['validatorsArray']) != JSON.stringify(this.tempFormDataList[formDataListFormControlNames.indexOf(controlName)]['validatorsArray']));
        if (flag) {
          this.setAndBindFormValidation(controlName, this.formDataList[formDataListFormControlNames.indexOf(controlName)]['validatorsArray']);

        }
      }
      else {
        this.formGroup.removeControl(controlName);
      }
    });

    if (formDataListFormControlNames.length > existingFormControls.length) {
      for (let i = 0; i < formDataListFormControlNames.length; i++) {
        if (existingFormControls.includes(formDataListFormControlNames[i]))
          continue;
        else {
          // add control
          let formControlName = formDataListFormControlNames[i];
          let defaultValue;
          try {
            defaultValue = this.formDataList[formDataListFormControlNames.indexOf(formControlName)]['value'];
          }
          catch (error) {
            defaultValue = '';
          }
          let formControl = new FormControl(defaultValue, this.formDataList[formDataListFormControlNames.indexOf(formControlName)]['validatorsArray']);
          this.formGroup.addControl(formControlName, formControl);
        }
      }
    }

  }


  setAndBindFormValidation(controlName, validationArray) {

    this.formGroup.get(controlName).setValidators(validationArray);
    this.formGroup.get(controlName).updateValueAndValidity({ emitEvent: false, onlySelf: true });
  }

  markFormDirty(form: FormGroup) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsDirty();
      });
      return;
    }
  }



}
