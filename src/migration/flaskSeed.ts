import { bulkSaveFlaskProducts, getFlaskContent, getFlaskProducts, saveFlaskContent } from '../api';
import { INITIAL_PRODUCTS } from '../data/products';
import { INITIAL_CATEGORIES } from '../data/categories';
import { INITIAL_BANNERS } from '../data/banners';
import { INITIAL_TREND_CAMPAIGNS } from '../data/trends';

const SEED_VERSION = 'flask-seed-v1';
let running = false;

function getRole(user: unknown): string {
  const value = user as { role?: string; isAdmin?: boolean } | null;
  return value?.role || (value?.isAdmin ? 'admin' : 'customer');
}

export async function runFirstStartFlaskMigration(user: unknown): Promise<void> {
  if (running || getRole(user) !== 'admin') return;
  running = true;
  try {
    const [serverProducts, serverContent] = await Promise.all([
      getFlaskProducts<Record<string, unknown>>(),
      getFlaskContent(),
    ]);

    const alreadySeeded = localStorage.getItem(SEED_VERSION) === '1';
    if (!alreadySeeded && serverProducts.length === 0 && INITIAL_PRODUCTS.length > 0) {
      await bulkSaveFlaskProducts(INITIAL_PRODUCTS);
    }

    const contentEmpty = !serverContent.categories?.length && !serverContent.banners?.length && !serverContent.campaigns?.length;
    if (!alreadySeeded && contentEmpty) {
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
  if (typeof window === 'undefined') return;
  window.addEventListener('flask-auth-changed', () => {
    void import('../api').then(({ fetchCurrentUser }) => fetchCurrentUser()).then((user) => runFirstStartFlaskMigration(user));
  });
}
