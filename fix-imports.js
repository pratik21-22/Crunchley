const fs = require('fs');
const path = require('path');

const mappings = {
    '@/components/header': '@/components/layout/header',
    '@/components/footer': '@/components/layout/footer',
    '@/components/admin': '@/components/layout/admin',
    '@/components/featured-products': '@/components/product/featured-products',
    '@/components/product-details-tabs': '@/components/product/product-details-tabs',
    '@/components/product-image-gallery': '@/components/product/product-image-gallery',
    '@/components/product-info': '@/components/product/product-info',
    '@/components/product-reviews': '@/components/product/product-reviews',
    '@/components/shop-by-flavours': '@/components/product/shop-by-flavours',
    '@/components/cart-item': '@/components/cart/cart-item',
    '@/components/checkout-form': '@/components/cart/checkout-form',
    '@/components/checkout-summary': '@/components/cart/checkout-summary',
    '@/components/order-summary': '@/components/cart/order-summary',
    '@/components/sticky-add-to-cart': '@/components/cart/sticky-add-to-cart',
    '@/components/cta-banner': '@/components/common/cta-banner',
    '@/components/customer-reviews': '@/components/common/customer-reviews',
    '@/components/why-choose-us': '@/components/common/why-choose-us',
    '@/components/theme-provider': '@/components/common/theme-provider',
    '@/components/auth-form': '@/components/common/auth-form'
};

function walk(dir) {
    if (!fs.existsSync(dir)) return [];
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./app').concat(walk('./components'));
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    for (const [oldPath, newPath] of Object.entries(mappings)) {
        // Simple replace all, since it's an import path. Works fine.
        content = content.replaceAll(oldPath, newPath);
    }
    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed imports in', file);
    }
});
