// Sample terrain plugin — Spatially-Aware Target Control demo
// Contract: window.registerTerrain({ id, name, heightAt, maxHeight, minHeight })
// heightAt(x, y) must return a finite Z for every (X, Y), be pure, and be fast
// (it is called thousands of times per frame during ray-marching).

window.registerTerrain({
    id: 'sample-hills',
    name: 'Sample: hills, mound, pit',
    heightAt: (x, y) => {
        const hill    = 3.0 * Math.exp(-(((x - 20) ** 2 + (y - 25) ** 2) / 100));
        const mound   = 1.5 * Math.exp(-(((x - 40) ** 2 + (y - 15) ** 2) / 30));
        const pit     = -1.0 * Math.exp(-(((x - 30) ** 2 + (y - 35) ** 2) / 40));
        const ripple  =  0.3 * Math.sin(x / 6) * Math.cos(y / 6);
        return hill + mound + pit + ripple;
    },
    maxHeight: 3.5,
    minHeight: -1.0,
});
