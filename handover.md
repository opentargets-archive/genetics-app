# Handover notes

## Plots

### Locus plot

- Most of the data transformation is done by `src/logic/locusScheme.js`, which calls the other scripts in the `src/logic` directory. This is probably the most involved part.
- The `fetchPolicy="network-only"` in `src/pages/LocusPage.js` on the query is important, as response data is very large and there is not much benefit in caching it.
- The `LocusPage` component has state, but this is managed in the URL rather than with React state.
- Selection state is intentionally an array of genes, an array of tag variants, an array of index variants and an array of studies (all of which could be empty).
- There is a list of **too dense regions**, which crash the API if queried. HLA on chromosome 6 is a good example. You can see the full list [here](https://github.com/opentargets/genetics-api/blob/master/resources/dense_regions.tsv). This should be resolved either by removing the locus plot or using the aggregated locus to gene score.
- There is an optimisation used due to the number of elements: SVG would be too slow, so there are two canvases instead. The first is rendered as you'd expect and is at the back. The second is hidden, but is in front and encodes each interactive element in a hex colour code, purely to enable interactivity. The hidden canvas is then used as a lookup, whenever the (single) canvas mouse event handler fires. See `_generateHiddenColors` in `ot-charts/lib/GeckoCanvas.js`.
- There's a partial solution to the aggregation (for locus to gene) in `ot-charts/lib/GeckoAggCanvas.js`, but this is works on client side aggregation of the existing data. When Ed's new locus to gene data is added, the API should serve something in a similar shape, if this route is taken.
- If you can find a lib or other way to do it, the logic to work out the SVG text layout for disease labels was quite involved.

## Other

- There are two blue colours in the live Genetics Portal, since `ot-charts` uses a different older one than the `theme.palette.primary.main` one in `ot-ui`.
- Add more legends to the charts.
- Add more explanation to the terminology (with the question mark tooltip). Might need to talk to some users.
- Data question: too many traits are **Uncategorised** in the PheWAS plot.
- Table column widths: trait names vary in length dramatically, would be good if column widths didn't jump as much when paginating.

### Locus-trait page

- The intersection table (of variants) should display those variants in all of the checked credible set/regional plots.

### Study comparison page

- Overlap based on variants in the manhattan plot (not ideal, coloc between GWAS is preferred; talk to Ed about whether to keep this?)
- The intersection table (of variants) should display those variants which are significant in all of the selected GWAS studies.

### Study page

- There are two gene lists per locus (top v2g genes and top colocalising genes).
- Are both needed? Top V2G genes probably has higher coverage.

### Gene page

- Worth raising that associated studies is not as clearly defined (ie. what makes an association), whereas most users are presumably aware of roughly what coloc is doing.
- Do we need both tables? Associated studies probably has higher coverage.

## Recommendations for refactoring

- Break the site down by directories per page, with an additional `common` directory.
- Move GraphQL queries adjacent to the components that use them.
- Move plots from `ot-charts` to `genetics-app` and deprecate `ot-charts` (or combine with monorepo migration).
- Sort out the top of the `GenePage` so that it is consistent (ideally have a common page header structure in the monorepo migration).
- Make buttons and links consistent (especially on homepage).
- Make a consistent heatmap (or set of subcomponents) that can be used on Genetics for coloc and V2G table and on Platform for classic/dynamic associations (?).
