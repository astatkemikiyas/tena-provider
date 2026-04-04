import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="flex flex-col w-60 min-h-screen bg-white border-r border-slate-200">
      <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div class="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
          <i class="pi pi-heart text-white text-sm"></i>
        </div>
        <span class="font-semibold text-slate-800 text-sm tracking-tight">Tena Provider</span>
      </div>
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
      </nav>
      <div class="px-3 py-4 border-t border-slate-100">
        <div class="flex items-center gap-3 px-3 py-2">
          <div class="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
            <i class="pi pi-user text-teal-600 text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-slate-700 truncate">Dr. Provider</p>
            <p class="text-xs text-slate-400 truncate">doctor&#64;tena.gov.et</p>
          </div>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {}
