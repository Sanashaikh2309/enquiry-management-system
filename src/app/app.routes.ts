import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { SubmitEnquiry } from './pages/submit-enquiry/submit-enquiry';
import { Dashboard } from './pages/dashboard/dashboard';
import { EnquiryList } from './pages/enquiry-list/enquiry-list';
import { UserGuard } from './guards/user.guard';
import { AdminGuard } from './guards/admin.guard';
import { Register } from './pages/register/register';
import { EnquiryView } from './pages/enquiry-view/enquiry-view';
import { EnquiryEdit } from './pages/enquiry-edit/enquiry-edit';


export const routes: Routes = [

    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: Home
    },
    {
        path: 'login',
        component: Login

    },
    {
        path:'register',
        component:Register

    },
    {
        path: 'submit-enquiry',
        component: SubmitEnquiry,
        canActivate:[UserGuard]
    },
    {
        path: 'dashboard',
        loadComponent: () =>
            import('./pages/dashboard/dashboard').then(m => m.Dashboard),
         canActivate : [UserGuard]
    },   
    {
        path: 'enquiry-list',
        component: EnquiryList,
        canActivate:[AdminGuard]
    },
    { 
        path: 'enquiry/:id',
        component: EnquiryView,
        canActivate:[AdminGuard]
    },
    { 
        path: 'enquiry-edit/:id',
        component: EnquiryEdit,
        canActivate:[AdminGuard]
    }  
];
