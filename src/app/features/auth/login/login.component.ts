import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col lg:flex-row bg-white">

      <!-- ── Left: Sign-in panel ──────────────────────────────── -->
      <div class="flex-1 flex flex-col min-h-screen lg:min-h-0">

        <!-- Top bar -->
        <div class="flex items-center justify-between px-8 pt-8 pb-4">
          <a routerLink="/" class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <i class="pi pi-arrow-left text-xs"></i> Go back
          </a>
          <span class="text-sm text-slate-500">
            New to TenaDigital?
            <a routerLink="/register" class="font-semibold text-primary-600 hover:text-primary-700 ml-1">Register here</a>
          </span>
        </div>

        <!-- Form area -->
        <div class="flex-1 flex items-center justify-center px-8 py-10">
          <div class="w-full max-w-md">

            <!-- Logo + wordmark -->
            <a routerLink="/" class="inline-flex items-center gap-3 mb-8">
              <img src="assets/images/logo.png" alt="TenaDigital" class="h-12 w-auto" />
              <div class="flex flex-col leading-none">
                <span class="font-extrabold text-slate-900 text-xl tracking-tight">TenaDigital</span>
                <span class="text-xs font-bold text-primary-600 tracking-widest uppercase mt-0.5">Provider Portal</span>
              </div>
            </a>

            <h1 class="text-[2rem] font-extrabold text-slate-900 tracking-tight mb-2">Welcome back</h1>
            <p class="text-slate-400 text-sm font-medium mb-8">Sign in to your provider account to continue</p>

            <!-- Auth card -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
              <p class="text-sm text-slate-500 mb-6 leading-relaxed">
                You will be redirected to the secure identity provider to sign in.
                Your session is fully encrypted and protected.
              </p>

              <button (click)="submit()"
                class="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold text-sm transition-all shadow-lg shadow-primary-600/25">
                <i class="pi pi-lock text-sm"></i>
                Sign In with Provider
              </button>

              <div class="flex items-center gap-3 mt-5">
                <div class="flex-1 h-px bg-slate-100"></div>
                <span class="text-xs font-semibold text-slate-400">Secure OAuth 2.0</span>
                <div class="flex-1 h-px bg-slate-100"></div>
              </div>

              <div class="flex items-center justify-center gap-4 mt-4">
                @for (f of trustBadges; track f.text) {
                  <div class="flex items-center gap-1.5 text-xs text-slate-400">
                    <i [class]="'pi text-primary-500 text-xs ' + f.icon"></i>
                    {{ f.text }}
                  </div>
                }
              </div>
            </div>

          </div>
        </div>

        <div class="px-8 py-6 text-xs text-slate-400">
          &copy; {{ year }} TenaDigital. All rights reserved.
        </div>
      </div>

      <!-- ── Right: Visual panel ──────────────────────────────── -->
      <div class="hidden lg:flex lg:w-[52%] xl:w-[54%] bg-slate-50 flex-col p-14 flex-shrink-0 border-l border-slate-100">

        <!-- Headline -->
        <div class="mb-10">
          <p class="text-xs font-black tracking-[0.2em] uppercase text-primary-500 mb-4">Provider portal</p>
          <h2 class="text-5xl xl:text-[3.25rem] font-extrabold leading-[1.06] tracking-tight text-slate-900 mb-5">
            Manage your<br/>
            <span class="text-primary-600">practice with ease.</span>
          </h2>
          <p class="text-slate-500 text-base leading-relaxed max-w-sm">
            Schedule slots, manage appointments, and coordinate with your hospital team all in one place.
          </p>
        </div>

        <!-- Feature cards row -->
        <div class="grid grid-cols-3 gap-4 mb-8">
          @for (f of features; track f.label) {
            <div class="bg-white rounded-2xl border border-slate-100 px-4 py-5 shadow-sm">
              <div class="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-3">
                <i [class]="'pi text-primary-600 text-sm ' + f.icon"></i>
              </div>
              <p class="text-sm font-bold text-slate-800 leading-snug">{{ f.label }}</p>
              <p class="text-xs text-slate-400 mt-1 leading-snug">{{ f.desc }}</p>
            </div>
          }
        </div>

        <!-- App preview card -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-primary-500"></div>
              <p class="text-sm font-bold text-slate-800">Today's Schedule</p>
            </div>
            <span class="text-xs font-semibold text-slate-400">
              {{ today }}
            </span>
          </div>
          <div class="divide-y divide-slate-50">
            @for (appt of schedule; track appt.time) {
              <div class="flex items-center gap-4 px-5 py-3.5">
                <div class="w-14 text-center flex-shrink-0">
                  <p class="text-xs font-bold text-primary-600">{{ appt.time }}</p>
                </div>
                <div class="w-px h-8 bg-slate-100 flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-800 truncate">{{ appt.patient }}</p>
                  <p class="text-xs text-slate-400 mt-0.5">{{ appt.type }}</p>
                </div>
                <span [class]="appt.statusClass">{{ appt.status }}</span>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private auth  = inject(AuthService);
  private route = inject(ActivatedRoute);

  readonly year  = new Date().getFullYear();
  readonly today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  trustBadges = [
    { icon: 'pi-lock',    text: 'Encrypted' },
    { icon: 'pi-shield',  text: 'Verified'  },
    { icon: 'pi-eye-slash', text: 'Private' },
  ];

  features = [
    { icon: 'pi-calendar', label: 'Slot Management',   desc: 'Create and manage availability slots' },
    { icon: 'pi-clipboard', label: 'Appointments',     desc: 'Track and update patient appointments' },
    { icon: 'pi-building',  label: 'Hospital Tools',   desc: 'Manage staff and facility info' },
  ];

  schedule = [
    { time: '09:00', patient: 'Abebe Girma',   type: 'General Consultation', status: 'Confirmed', statusClass: 'text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0' },
    { time: '10:30', patient: 'Tigist Bekele', type: 'Follow-up Visit',       status: 'Pending',   statusClass: 'text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0'   },
    { time: '13:00', patient: 'Yonas Haile',   type: 'Cardiology Review',    status: 'Confirmed', statusClass: 'text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0' },
  ];

  ngOnInit() {
    const invite = this.route.snapshot.queryParamMap.get('invite');
    if (invite) sessionStorage.setItem('pending_invite_token', invite);
  }

  submit() { this.auth.login(); }
}
