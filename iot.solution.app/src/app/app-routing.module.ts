import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { SelectivePreloadingStrategy } from './selective-preloading-strategy'
import { PageNotFoundComponent } from './page-not-found.component'
import {
  DynamicDashboardComponent,
  CallbackComponent,HomeComponent, UserListComponent, UserAddComponent, DashboardComponent,
  LoginComponent, RegisterComponent, MyProfileComponent, ResetpasswordComponent, SettingsComponent,
  ChangePasswordComponent, AdminLoginComponent, SubscribersListComponent, HardwareListComponent, HardwareAddComponent,
  UserAdminListComponent, AdminUserAddComponent, AdminDashboardComponent, SubscriberDetailComponent,
  BulkuploadAddComponent, RolesListComponent, RolesAddComponent, AlertsComponent,
  LocationListComponent, VendingMachinesListComponent, MaintenanceListComponent, ProductsListComponent, InventoryListComponent, AddLocationComponent, AddMachineComponent, LocationDetailsComponent,
  VendingMachineDashboardComponent, ScheduleMaintenanceComponent, AddProductsComponent, AddInventoryComponent
} from './components/index';


import { AuthService, AdminAuthGuard } from './services/index'




const appRoutes: Routes = [
  {
    path: 'admin',
    children: [
      {
        path: '',
        component: AdminLoginComponent
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        canActivate: [AuthService]
      },
      {
        path: 'subscribers/:email/:productCode/:companyId',
        component: SubscriberDetailComponent,
        canActivate: [AuthService]
      },
      {
        path: 'subscribers',
        component: SubscribersListComponent,
        canActivate: [AuthService]
      },
      {
        path: 'hardwarekits',
        component: HardwareListComponent,
        canActivate: [AuthService]
      },
      {
        path: 'hardwarekits/bulkupload',
        component: BulkuploadAddComponent,
        canActivate: [AuthService]
      },
      {
        path: 'hardwarekits/addhardwarekit',
        component: HardwareAddComponent,
        canActivate: [AuthService]
      },
      {
        path: 'hardwarekits/:hardwarekitGuid',
        component: HardwareAddComponent,
        canActivate: [AuthService]
      },
      {
        path: 'users',
        component: UserAdminListComponent,
        canActivate: [AuthService]
      },
      {
        path: 'users/adduser',
        component: AdminUserAddComponent,
        canActivate: [AuthService]
      },
      {
        path: 'users/:userGuid',
        component: AdminUserAddComponent,
        canActivate: [AuthService]
      },

    ]
  },
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'callback',
    component: CallbackComponent
  },
  {
    path: 'login',
    component: LoginComponent,
    // canActivate: [AuthService]
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  //App routes goes here 
  {
    path: 'my-profile',
    component: MyProfileComponent,
    //canActivate: [AuthService]
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    //canActivate: [AuthService]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'locations',
    component: LocationListComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'locations/add',
    component: AddLocationComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'locations/details',
    component: LocationDetailsComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'vending-machines',
    component: VendingMachinesListComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'vending-machines/:deviceGuid',
    component: AddMachineComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'vending-machines/add',
    component: AddMachineComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'vending-machines/dashboard/:deviceGuid',
    component: VendingMachineDashboardComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'maintenance',
    component: MaintenanceListComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'maintenance/:maintenanceGuid',
    component: ScheduleMaintenanceComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'maintenance/add',
    component: ScheduleMaintenanceComponent,
    canActivate: [AdminAuthGuard]
  },

  {
    path: 'products',
    component: ProductsListComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'products/:productGuid',
    component: AddProductsComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'products/add',
    component: AddProductsComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'inventory',
    component: InventoryListComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'inventory/:inventoryGuid',
    component: AddInventoryComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'inventory/add',
    component: AddInventoryComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'location/add',
    component: AddLocationComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'locations/:locationGuid',
    component: AddLocationComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'locations/detail/:locationGuid',
    component: LocationDetailsComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'alerts',
    component: AlertsComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'alerts/location/:entityGuid',
    component: AlertsComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'alerts/vending-machines/:deviceGuid',
    component: AlertsComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'users/:userGuid',
    component: UserAddComponent,
    canActivate: [AdminAuthGuard]
  }, {
    path: 'users/add',
    component: UserAddComponent,
    canActivate: [AdminAuthGuard]
  }, {
    path: 'users',
    component: UserListComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'roles/:deviceGuid',
    component: RolesAddComponent,
    canActivate: [AdminAuthGuard]
  }, {
    path: 'roles',
    component: RolesListComponent,
    canActivate: [AdminAuthGuard]
  },
  {
		path: 'dynamic-dashboard',
		component: DynamicDashboardComponent,
		canActivate: [AdminAuthGuard]
	},
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes, {
      preloadingStrategy: SelectivePreloadingStrategy
    }
    )
  ],
  exports: [
    RouterModule
  ],
  providers: [
    SelectivePreloadingStrategy
  ]
})

export class AppRoutingModule { }
