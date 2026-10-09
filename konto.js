import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js?v=2';

const $ = (id) => document.getElementById(id);
const setupNotice = $('setupNotice');
const authView = $('authView');
const userView = $('userView');
const authForm = $('authForm');
const authMessage = $('authMessage');
const profileMessage = $('profileMessage');
const loginTab = $('loginTab');
const registerTab = $('registerTab');
const usernameField = $('usernameField');
const submitButton = $('submitButton');
const resetPassword = $('resetPassword');
let mode = 'login';
let supabase = null;
let currentUser = null;

function message(el, text, type = '') {
  el.textContent = text;
  el.className = 'notice show' + (type ? ` notice-${type}` : '');
}
function clearMessage(el) { el.textContent = ''; el.className = 'notice'; }
function setMode(next) {
  mode = next;
  const isRegister = mode === 'register';
  loginTab.classList.toggle('active', !isRegister);
  registerTab.classList.toggle('active', isRegister);
  loginTab.setAttribute('aria-selected', String(!isRegister));
  registerTab.setAttribute('aria-selected', String(isRegister));
  usernameField.classList.toggle('field-hidden', !isRegister);
  $('password').autocomplete = isRegister ? 'new-password' : 'current-password';
  submitButton.innerHTML = isRegister ? 'UTWÓRZ KONTO <span>→</span>' : 'ZALOGUJ SIĘ <span>→</span>';
  $('accountTitle').innerHTML = isRegister ? 'Dołącz do <em>BADPLAY.</em>' : 'Witaj w <em>BADPLAY.</em>';
  clearMessage(authMessage);
}
function friendlyError(error) {
  const text = String(error?.message || 'Wystąpił nieoczekiwany błąd.');
  if (/Invalid login credentials/i.test(text)) return 'Nieprawidłowy e-mail lub hasło.';
  if (/User already registered/i.test(text)) return 'Konto z tym adresem e-mail już istnieje. Zaloguj się.';
  if (/Email not confirmed/i.test(text)) return 'Potwierdź adres e-mail, a następnie zaloguj się.';
  if (/Password should be at least/i.test(text)) return 'Hasło jest za krótkie. Użyj co najmniej 8 znaków.';
  return text;
}
function showAuth() {
  authView.classList.remove('hidden');
  userView.classList.add('hidden');
  currentUser = null;
}
async function showUser(user) {
  currentUser = user;
  authView.classList.add('hidden');
  userView.classList.remove('hidden');
  clearMessage(profileMessage);
  $('profileEmail').textContent = user.email || 'Konto BADPLAY';
  $('profileAvatar').textContent = (user.email || 'B').slice(0,1).toUpperCase();
  $('profileName').textContent = (user.user_metadata?.minecraft_name || user.email?.split('@')[0] || 'graczu') + '.';
  $('editMinecraftName').value = user.user_metadata?.minecraft_name || '';

  // Rola pochodzi z tabeli chronionej przez RLS, nie z danych przekazanych przez przeglądarkę.
  const { data: profile, error } = await supabase.from('profiles')
    .select('id, email, minecraft_username, role')
    .eq('id', user.id).maybeSingle();
  if (error) {
    message(profileMessage, 'Konto działa, ale nie udało się pobrać profilu. Sprawdź konfigurację SQL/RLS w AUTH-SETUP.md.', 'error');
    return;
  }
  const role = profile?.role === 'admin' ? 'admin' : 'user';
  $('profileRole').textContent = role === 'admin' ? 'ADMINISTRATOR' : 'UŻYTKOWNIK';
  $('profileRole').classList.toggle('admin', role === 'admin');
  $('profileMinecraft').textContent = profile?.minecraft_username ? `Nick Minecraft: ${profile.minecraft_username}` : 'Nick Minecraft: niepowiązany';
  $('editMinecraftName').value = profile?.minecraft_username || '';
  $('profileName').textContent = (profile?.minecraft_username || user.email?.split('@')[0] || 'graczu') + '.';
  $('adminPanel').classList.toggle('hidden', role !== 'admin');
}
async function refreshSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) await showUser(session.user); else showAuth();
}

loginTab.addEventListener('click', () => setMode('login'));
registerTab.addEventListener('click', () => setMode('register'));
authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage(authMessage);
  const email = $('email').value.trim();
  const password = $('password').value;
  submitButton.disabled = true;
  try {
    if (mode === 'register') {
      const minecraftName = $('minecraftName').value.trim();
      const options = { data: { minecraft_name: minecraftName || null } };
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: options.data, emailRedirectTo: `${location.origin}${location.pathname}` } });
      if (error) throw error;
      if (data.session) {
        await showUser(data.user);
        message(profileMessage, 'Konto utworzone. Witaj w BADPLAY!', 'success');
      } else {
        message(authMessage, 'Konto utworzone. Sprawdź skrzynkę e-mail i potwierdź adres przed pierwszym logowaniem.', 'success');
        authForm.reset();
        setMode('login');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await showUser(data.user);
    }
  } catch (error) {
    message(authMessage, friendlyError(error), 'error');
  } finally {
    submitButton.disabled = false;
  }
});
resetPassword.addEventListener('click', async () => {
  const email = $('email').value.trim();
  if (!email) { message(authMessage, 'Najpierw wpisz swój adres e-mail.', 'error'); return; }
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}${location.pathname}` });
    if (error) throw error;
    message(authMessage, 'Jeśli konto istnieje, wysłaliśmy instrukcję resetowania hasła.', 'success');
  } catch (error) { message(authMessage, friendlyError(error), 'error'); }
});
$('signOut').addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) { message(profileMessage, friendlyError(error), 'error'); return; }
  showAuth(); setMode('login'); message(authMessage, 'Wylogowano z konta BADPLAY.', 'success');
});
$('saveProfile').addEventListener('click', async () => {
  if (!currentUser) return;
  const username = $('editMinecraftName').value.trim();
  if (username && !/^[A-Za-z0-9_]{3,16}$/.test(username)) {
    message(profileMessage, 'Nick Minecraft musi mieć 3–16 znaków: litery, cyfry lub podkreślenie.', 'error'); return;
  }
  const { error } = await supabase.from('profiles').update({ minecraft_username: username || null }).eq('id', currentUser.id);
  if (error) { message(profileMessage, 'Nie udało się zapisać profilu. Sprawdź, czy wykonano SQL z AUTH-SETUP.md.', 'error'); return; }
  await showUser(currentUser);
  message(profileMessage, 'Profil zapisany.', 'success');
});

const configured = SUPABASE_URL.startsWith('https://') && !SUPABASE_URL.includes('WKLEJ_') && SUPABASE_ANON_KEY.length > 20 && !SUPABASE_ANON_KEY.includes('WKLEJ_');
if (!configured) {
  setupNotice.classList.add('show');
  authForm.querySelectorAll('input,button').forEach((el) => { el.disabled = true; });
  resetPassword.disabled = true;
} else {
  setupNotice.classList.remove('show');
  import('https://esm.sh/@supabase/supabase-js@2').then(({ createClient }) => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    supabase.auth.onAuthStateChange((_event, session) => {
      // Odsuń zapytania do profilu poza callback auth, aby uniknąć blokowania locka sesji.
      setTimeout(() => { if (session?.user) showUser(session.user); else showAuth(); }, 0);
    });
    refreshSession();
  }).catch(() => message(authMessage, 'Nie udało się załadować modułu logowania. Sprawdź połączenie z internetem.', 'error'));
}
