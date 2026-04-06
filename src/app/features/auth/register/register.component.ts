import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="w-full max-w-lg">

        <!-- Logo + wordmark -->
        <a routerLink="/login" class="inline-flex items-center gap-3 mb-8">
          <img src="assets/images/logo.png" alt="TenaDigital" class="h-12 w-auto" />
          <div class="flex flex-col leading-none">
            <span class="font-extrabold text-slate-900 text-xl tracking-tight">TenaDigital</span>
            <span class="text-xs font-bold text-primary-600 tracking-widest uppercase mt-0.5">Provider Portal</span>
          </div>
        </a>

        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Join TenaDigital</h1>
        <p class="text-slate-400 text-sm font-medium mb-7">Choose how you want to register your account</p>

        <div class="space-y-4">

          <a routerLink="/register/hospital"
             class="flex items-start gap-5 bg-white rounded-2xl border border-slate-200 p-6 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group">
            <div class="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors flex-shrink-0 mt-0.5">
              <i class="pi pi-building text-primary-600 text-xl"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-3">
                <h3 class="font-bold text-slate-800 text-base">Register a Hospital</h3>
                <i class="pi pi-arrow-right text-xs text-slate-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all flex-shrink-0"></i>
              </div>
              <p class="text-slate-500 text-sm mt-1 leading-relaxed">For hospital administrators. Register your facility and manage your medical staff.</p>
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full mt-3">
                <i class="pi pi-clock text-xs"></i> Requires government approval
              </span>
            </div>
          </a>

          <a routerLink="/register/doctor"
             class="flex items-start gap-5 bg-white rounded-2xl border border-slate-200 p-6 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group">
            <div class="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors flex-shrink-0 mt-0.5">
              <i class="pi pi-user text-primary-600 text-xl"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-3">
                <h3 class="font-bold text-slate-800 text-base">Register as a Doctor</h3>
                <i class="pi pi-arrow-right text-xs text-slate-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all flex-shrink-0"></i>
              </div>
              <p class="text-slate-500 text-sm mt-1 leading-relaxed">For licensed medical practitioners. Get verified and start managing appointments.</p>
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full mt-3">
                <i class="pi pi-clock text-xs"></i> Requires license verification
              </span>
            </div>
          </a>

        </div>

        <p class="text-center text-sm text-slate-500 mt-7">
          Already have an account?
          <a routerLink="/login" class="font-semibold text-primary-600 hover:text-primary-700 ml-1">Sign in</a>
        </p>
        <p class="text-center text-xs text-slate-400 mt-8">
          &copy; {{ year }} TenaDigital. All rights reserved.
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  readonly year = new Date().getFullYear();
}
