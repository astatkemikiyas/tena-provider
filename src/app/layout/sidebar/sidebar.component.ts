import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HospitalContextService } from '../../core/services/hospital-context.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="flex flex-col w-64 min-h-screen bg-white border-r border-slate-100">

      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <img src="assets/images/logo.png" alt="TenaDigital" class="h-9 w-auto" />
        <div class="flex flex-col leading-none min-w-0">
          <span class="font-extrabold text-slate-900 text-base tracking-tight">TenaDigital</span>
          <span class="text-[10px] font-bold text-primary-600 tracking-widest uppercase mt-0.5">Provider Portal</span>
        </div>
      </div>

      <!-- Hospital context banner -->
      @if (ctx.selectedHospital()) {
        <div class="mx-3 my-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
          <p class="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-0.5">Current Hospital</p>
          <p class="text-sm font-bold text-slate-800 truncate">{{ ctx.selectedHospital()!.name }}</p>
          <p class="text-xs font-medium text-primary-600 mt-0.5">{{ ctx.selectedHospital()!.userRole }}</p>
        </div>
      }

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">

        <p class="px-3 pt-1 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Workspace</p>

        <a routerLink="/slots" routerLinkActive="bg-primary-50 text-primary-700 font-semibold"
           class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition-colors group">
          <i class="pi pi-calendar text-base group-[.bg-primary-50]:text-primary-600"></i>
          My Slots
        </a>

        <a routerLink="/appointments" routerLinkActive="bg-primary-50 text-primary-700 font-semibold"
           class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition-colors group">
          <i class="pi pi-clipboard text-base group-[.bg-primary-50]:text-primary-600"></i>
          Appointments
        </a>

        @if (ctx.selectedHospital()) {
          <div class="pt-3 pb-1">
            <p class="px-3 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Hospital</p>
          </div>

          <a routerLink="/hospital/info" routerLinkActive="bg-primary-50 text-primary-700 font-semibold"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition-colors group">
            <i class="pi pi-building text-base group-[.bg-primary-50]:text-primary-600"></i>
            Hospital Info
          </a>

          @if (ctx.isAdmin()) {
            <a routerLink="/hospital/staff" routerLinkActive="bg-primary-50 text-primary-700 font-semibold"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition-colors group">
              <i class="pi pi-users text-base group-[.bg-primary-50]:text-primary-600"></i>
              Staff Management
            </a>

            <a routerLink="/hospital/invite" routerLinkActive="bg-primary-50 text-primary-700 font-semibold"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition-colors group">
              <i class="pi pi-user-plus text-base group-[.bg-primary-50]:text-primary-600"></i>
              Invite Doctors
            </a>
          }

          <button (click)="switchHospital()"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 text-sm hover:bg-slate-50 hover:text-slate-600 transition-colors w-full text-left">
            <i class="pi pi-arrow-right-arrow-left text-base"></i>
            Switch Hospital
          </button>
        }
      </nav>

      <!-- User section -->
      <div class="border-t border-slate-100 p-3">
        <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
          <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
            <span class="text-xs font-bold text-white">{{ userInitials() }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-slate-700 truncate">{{ userEmail() }}</p>
            <p class="text-[10px] text-slate-400 font-medium">Provider</p>
          </div>
          <button (click)="logout()" title="Sign out"
                  class="text-slate-300 hover:text-rose-500 transition-colors flex-shrink-0">
            <i class="pi pi-sign-out text-sm"></i>
          </button>
        </div>
      </div>

    </aside>
  `,
})
export class SidebarComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  ctx = inject(HospitalContextService);

  userEmail(): string {
    const p = this.auth.decodeToken();
    return p?.email ?? p?.preferred_username ?? 'Provider';
  }

  userInitials(): string {
    const p = this.auth.decodeToken();
    const name = p?.given_name ?? p?.preferred_username ?? 'P';
    return name.slice(0, 2).toUpperCase();
  }

  switchHospital() {
    this.ctx.clearHospital();
    this.router.navigate(['/select-hospital']);
  }

  logout() {
    this.ctx.clearHospital();
    this.auth.logout();
  }
}
