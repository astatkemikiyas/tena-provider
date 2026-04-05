import { Component, inject } from '@angular/core';
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
    <aside class="flex flex-col w-60 min-h-screen bg-white border-r border-slate-200">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div class="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
          <i class="pi pi-heart text-white text-sm"></i>
        </div>
        <span class="font-semibold text-slate-800 text-sm tracking-tight">TenaDigital Provider</span>
      </div>

      <!-- Hospital context banner -->
      @if (ctx.selectedHospital()) {
        <div class="px-4 py-3 bg-teal-50 border-b border-teal-100">
          <p class="text-xs text-teal-600 font-semibold uppercase tracking-wider">Current Hospital</p>
          <p class="text-sm font-medium text-slate-800 truncate mt-0.5">{{ ctx.selectedHospital()!.name }}</p>
          <p class="text-xs text-slate-500 mt-0.5">{{ ctx.selectedHospital()!.userRole }}</p>
        </div>
      }

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-0.5">
        <p class="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace</p>
        <a routerLink="/slots" routerLinkActive="bg-teal-50 text-teal-700 font-medium"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors">
          <i class="pi pi-calendar text-base"></i> My Slots
        </a>
        <a routerLink="/appointments" routerLinkActive="bg-teal-50 text-teal-700 font-medium"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors">
          <i class="pi pi-clipboard text-base"></i> Appointments
        </a>

        @if (ctx.selectedHospital()) {
          <p class="px-3 mb-2 mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Hospital</p>
          <a routerLink="/hospital/info" routerLinkActive="bg-teal-50 text-teal-700 font-medium"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors">
            <i class="pi pi-building text-base"></i> Hospital Info
          </a>
          @if (ctx.isAdmin()) {
            <a routerLink="/hospital/staff" routerLinkActive="bg-teal-50 text-teal-700 font-medium"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors">
              <i class="pi pi-users text-base"></i> Staff Management
            </a>
            <a routerLink="/hospital/invite" routerLinkActive="bg-teal-50 text-teal-700 font-medium"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors">
              <i class="pi pi-user-plus text-base"></i> Invite Doctors
            </a>
          }
          <button (click)="switchHospital()"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 text-sm hover:bg-slate-50 transition-colors w-full text-left mt-1">
            <i class="pi pi-arrow-right-arrow-left text-base"></i> Switch Hospital
          </button>
        }
      </nav>

      <!-- User / logout -->
      <div class="px-3 py-4 border-t border-slate-100">
        <div class="flex items-center gap-3 px-3 py-2">
          <div class="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
            <i class="pi pi-user text-teal-600 text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-slate-700 truncate">{{ userEmail() }}</p>
          </div>
          <button (click)="logout()" title="Logout"
                  class="text-slate-400 hover:text-slate-600 transition-colors">
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

  switchHospital() {
    this.ctx.clearHospital();
    this.router.navigate(['/select-hospital']);
  }

  logout() {
    this.ctx.clearHospital();
    this.auth.logout();
  }
}
