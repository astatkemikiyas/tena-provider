import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div class="w-full max-w-lg">
        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg mx-auto mb-3">
            <i class="pi pi-heart text-white text-2xl"></i>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">Join TenaDigital</h1>
          <p class="text-slate-500 text-sm mt-1">Choose how you want to register</p>
        </div>

        <div class="grid gap-4">
          <a routerLink="/register/hospital"
             class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors flex-shrink-0">
                <i class="pi pi-building text-teal-600 text-xl"></i>
              </div>
              <div>
                <h3 class="font-semibold text-slate-800 text-lg">Register a Hospital</h3>
                <p class="text-slate-500 text-sm mt-1">For hospital administrators. Register your facility and manage staff.</p>
                <span class="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-2">
                  <i class="pi pi-clock text-xs"></i> Requires government approval
                </span>
              </div>
            </div>
          </a>

          <a routerLink="/register/doctor"
             class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors flex-shrink-0">
                <i class="pi pi-user text-teal-600 text-xl"></i>
              </div>
              <div>
                <h3 class="font-semibold text-slate-800 text-lg">Register as a Doctor</h3>
                <p class="text-slate-500 text-sm mt-1">For licensed medical practitioners. Get verified and join hospitals.</p>
                <span class="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-2">
                  <i class="pi pi-clock text-xs"></i> Requires license verification
                </span>
              </div>
            </div>
          </a>
        </div>

        <p class="text-center text-sm text-slate-500 mt-6">
          Already have an account?
          <a routerLink="/login" class="text-teal-600 font-semibold hover:text-teal-700 ml-1">Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {}
