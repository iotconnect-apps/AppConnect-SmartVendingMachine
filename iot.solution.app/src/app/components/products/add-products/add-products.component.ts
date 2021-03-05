import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NotificationService, Notification } from '../../../services';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProductService } from '../../../services/product/product.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageAlertDataModel, DeleteAlertDataModel, AppConstant } from '../../../app.constants';
import { MessageDialogComponent, DeleteDialogComponent } from '../..';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-products',
  templateUrl: './add-products.component.html',
  styleUrls: ['./add-products.component.css']
})
export class AddProductsComponent implements OnInit {

  @ViewChild('myFile', { static: false }) myFile: ElementRef;
  MessageAlertDataModel: MessageAlertDataModel;
  deleteAlertDataModel: DeleteAlertDataModel;
  moduleName: string = 'Add Product';
  buttonName: string = 'Submit';
  productTypes: any = [];
  productForm: FormGroup;
  productObject: any = {};
  checkSubmitStatus = false;
  handleImgInput = false;
  fileUrl: any;
  fileName = '';
  fileToUpload: any;
  currentImage: any;
  isEdit = false;
  hasImage = false;
  productGuid = '';
  buttonname = 'Submit';
  mediaUrl: any;

  constructor(public _service: ProductService,
    private _notificationService: NotificationService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public _appConstant: AppConstant,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.createFormGroup();
    this.activatedRoute.params.subscribe(params => {
      if (params.productGuid != 'add') {
        this.getProductDetails(params.productGuid);
        this.productGuid = params.productGuid;
        this.moduleName = "Edit Product";
        this.isEdit = true;
        this.buttonname = 'Update'
      } else {
        this.productObject = { productTypeGuid: '', name: '', image: '' }
      }
    });
  }

  ngOnInit() {
    this.mediaUrl = this._notificationService.apiBaseUrl;
    this.gettypelookup();
  }

  createFormGroup() {
    this.productForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      productTypeGuid: new FormControl('', [Validators.required]),
      imageFile: new FormControl(''),
      guid: new FormControl(null),
      isActive: new FormControl('', [Validators.required]),
    });
  }

  /**
   * Get Product Type Lookup
   * */
  gettypelookup() {
    this.productTypes = [];
    this._service.getProductType('producttype').
      subscribe(response => {
        if (response.isSuccess === true) {
          this.productTypes = response['data'];
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }

  /**
   * Handle image input
   * @param event
   */
  handleImageInput(event) {
    this.handleImgInput = true;
    let files = event.target.files;
    var that = this;
    if (files.length) {
      let fileType = files.item(0).name.split('.');
      let imagesTypes = ['jpeg', 'JPEG', 'jpg', 'JPG', 'png', 'PNG'];
      if (imagesTypes.indexOf(fileType[fileType.length - 1]) !== -1) {
        this.fileName = files.item(0).name;
        this.fileToUpload = files.item(0);
        if (event.target.files && event.target.files[0]) {
          var reader = new FileReader();
          reader.readAsDataURL(event.target.files[0]);
          reader.onload = (innerEvent: any) => {
            this.fileUrl = innerEvent.target.result;
            that.productObject.image = this.fileUrl;
          }
        }
      } else {
        this.imageRemove();
        this.MessageAlertDataModel = {
          title: "Product Image",
          message: "Invalid Image Type.",
          message2: "Upload .jpg, .jpeg, .png Image Only.",
          okButtonName: "OK",
        };
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          width: '400px',
          height: 'auto',
          data: this.MessageAlertDataModel,
          disableClose: false
        });
      }
    }
  }

  /**
   * Remove image
   * */
  imageRemove() {
    this.myFile.nativeElement.value = "";
    if (this.productObject['image'] == this.currentImage) {
      if (this.isEdit && this.hasImage) {
        this.productForm.get('imageFile').setValue('');
        if (!this.handleImgInput) {
          this.handleImgInput = false;
          this.deleteImgModel();
        }
        else {
          this.handleImgInput = false;
        }
      } else {
        this.spinner.hide();
        this.productObject['image'] = null;
        this.productForm.get('imageFile').setValue('');
      }
    }
    else {
      if (this.currentImage) {
        this.spinner.hide();
        this.productObject['image'] = this.currentImage;
        this.fileToUpload = false;
        this.fileName = '';
      }
      else {
        this.spinner.hide();
        this.productObject['image'] = null;
        this.productForm.get('imageFile').setValue('');
        this.fileToUpload = false;
        this.fileName = '';
      }
    }

  }

  /**
   * Confirmation popup
   * */
  deleteImgModel() {
    this.deleteAlertDataModel = {
      title: "Delete Image",
      message: this._appConstant.msgConfirm.replace('modulename', "Product Image"),
      okButtonName: "Confirm",
      cancelButtonName: "Cancel",
    };
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      data: this.deleteAlertDataModel,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteproductImg();
      }
    });
  }

  /**
   * Delete image 
   * */
  deleteproductImg() {
    this.spinner.show();
    this._service.removeImage(this.productGuid).subscribe(response => {
      this.spinner.hide();
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.productObject['image'] = null;
        this.currentImage = '';
        this.productForm.get('image').setValue('');
      } else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  /**
   * Get product details by productGuid
   * @param productGuid
   */
  getProductDetails(productGuid) {
    this.spinner.show();
    this._service.getProductDetails(productGuid).subscribe(response => {
      if (response.isSuccess === true) {
        
        this.productObject = response.data;
        if (this.productObject.productTypeGuid) {
          this.productObject.productTypeGuid = this.productObject.productTypeGuid.toUpperCase();
        }
        if (this.productObject.image) {
          this.productObject.image = this.mediaUrl + this.productObject.image;
          this.currentImage = this.productObject.image;
          this.hasImage = true;
        } else {
          this.hasImage = false;
        }
        this.spinner.hide();
      }
    });
  }

  /**
   * Add update product
   * */
  manageProduct() {
    this.checkSubmitStatus = true;
    if (this.isEdit) {
      this.productForm.get('guid').setValue(this.productGuid);
      this.productForm.get('isActive').setValue(this.productObject['isActive']);
    } else {
      this.productForm.get('isActive').setValue(true);
    }
    if (this.productForm.status === "VALID") {
      if (this.fileToUpload) {
        this.productForm.get('imageFile').setValue(this.fileToUpload);
      }
      this.spinner.show();
      this._service.addProduct(this.productForm.value).subscribe(response => {
        this.spinner.hide();
        if (response.isSuccess === true) {
          if (this.isEdit) {
            this._notificationService.add(new Notification('success', "Product updated successfully."));
          } else {
            this._notificationService.add(new Notification('success', "Product created successfully."));
          }
          this.router.navigate(['/products']);
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      });
    }
  }
}
