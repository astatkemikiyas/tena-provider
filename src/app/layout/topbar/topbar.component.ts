import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="flex items-center justify-between h-14 px-6 bg-white border-b border-slate-200">
      <div>
        <h1 class="text-sm font-semibold text-slate-800">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="text-xs text-slate-400">{{ subtitle() }}</p>
        }
      </div>
      <div class="flex items-center gap-2">
        <button class="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <i class="pi pi-bell text-sm"></i>
        </button>
        <button class="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <i class="pi pi-cog text-sm"></i>
        </button>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  title   = input('Dashboard');
  subtitle = input('');
}
