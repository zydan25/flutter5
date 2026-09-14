import { bulkSaveFlaskProducts, fetchCurrentUser, getFlaskContent, saveFlaskContent } from '../api';
import { INITIAL_PRODUCTS } from '../data/products';
import { INITIAL_CATEGORIES } from '../data/categories';
import { INITIAL_BANNERS } from '../data/banners';
import { INITIAL_TREND_CAMPAIGNS } from '../data/trends';

const SEED_VERSION = 'flask-seed-v1';
let running = false;
let timer: number | undefined;

function getRole(user: unknown): string {
  const value = user as { role?: string; isAdmin?: boolean } | null;
  return value?.role || (value?.isAdmin ? 'admin' : 'customer');
}

export async function runFirstStartFlaskMigration(user: unknown): Promise<void> {
  if (running || getRole(user) !== 'admin') return;
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEED_VERSION) === '1') return;

  running = true;
  try {
    // This is intentionally an upsert of the complete local catalog once per browser.
    // It lets the first authenticated administrator move the existing UI catalog to Flask.
    if (INITIAL_PRODUCTS.length > 0) {
      await bulkSaveFlaskProducts(INITIAL_PRODUCTS);
    }

    const serverContent = await getFlaskContent();
    const contentEmpty = !serverContent.categories?.length && !serverContent.banners?.length && !serverContent.campaigns?.length;
    if (contentEmpty) {
      await saveFlaskContent({
        categories: INITIAL_CATEGORIES,
        banners: INITIAL_BANNERS,
        campaigns: INITIAL_TREND_CAMPAIGNS,
      });
    }

    localStorage.setItem(SEED_VERSION, '1');
  } catch (error) {
    console.warn('Flask first-start migration skipped:', error);
  } finally {
    running = false;
  }
}

export function registerFlaskMigrationListener(): void {
  if (typeof window === 'undefined' || timer !== undefined) return;
  const check = () => void fetchCurrentUser().then((user) => runFirstStartFlaskMigration(user));
  window.addEventListener('flask-auth-changed', check);
  check();
  timer = window.setInterval(check, 5000);
}
