import type { Collection } from 'tinacms';

const Route: Collection = {
  label: 'Routes',
  name: 'route',
  path: 'content/routes',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      return `/routes/${document._sys.breadcrumbs.join('/')}`;
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
      isTitle: true,
      required: true,
    },
    {
      type: 'image',
      name: 'featuredImage',
      label: 'Featured Image',
      // @ts-ignore
      uploadDir: () => 'routes',
    },
    {
      type: 'number',
      label: 'Miles (Round Trip)',
      name: 'miles',
      description: 'Total distance in miles',
    },
    {
      type: 'number',
      label: 'Elevation Gain (feet)',
      name: 'gain',
      description: 'Total elevation gain in feet',
    },
    {
      type: 'number',
      label: 'Highest Elevation (feet)',
      name: 'highestElevation',
      description: 'Highest point on route in feet',
    },
    {
      type: 'string',
      label: 'Class Rating',
      name: 'classRating',
      options: [
        { value: 'class2', label: 'Class 2' },
        { value: 'class3', label: 'Class 3' },
        { value: 'class4', label: 'Class 4' },
        { value: 'class5', label: 'Class 5' },
      ],
    },
    {
      type: 'string',
      label: 'YDS Rating',
      name: 'ydsRating',
      description: 'Only applicable for Class 5 routes',
      options: [
        { value: '5.0', label: '5.0' },
        { value: '5.1', label: '5.1' },
        { value: '5.2', label: '5.2' },
        { value: '5.3', label: '5.3' },
        { value: '5.4', label: '5.4' },
        { value: '5.5', label: '5.5' },
        { value: '5.6', label: '5.6' },
        { value: '5.7', label: '5.7' },
        { value: '5.8', label: '5.8' },
        { value: '5.9', label: '5.9' },
        { value: '5.10', label: '5.10' },
        { value: '5.11', label: '5.11' },
        { value: '5.12', label: '5.12' },
        { value: '5.13', label: '5.13' },
        { value: '5.14', label: '5.14' },
        { value: '5.15', label: '5.15' },
      ],
    },
    {
      type: 'string',
      label: 'YDS Sub-rating',
      name: 'ydsSubRating',
      description: 'Only applicable for Class 5 routes',
      options: [
        { value: 'none', label: 'None' },
        { value: '-', label: '-' },
        { value: '+', label: '+' },
        { value: 'a', label: 'a' },
        { value: 'b', label: 'b' },
        { value: 'c', label: 'c' },
        { value: 'd', label: 'd' },
        { value: 'e', label: 'e' },
      ],
    },
    {
      type: 'number',
      label: 'Pitches',
      name: 'pitches',
      description: 'Only applicable for Class 5 routes',
    },
    {
      type: 'reference',
      label: 'Parent Area',
      name: 'parentArea',
      collections: ['area'],
      ui: {
        optionComponent: (
          props: {
            title?: string;
          },
          _internalSys: { path: string }
        ) => props.title || _internalSys.path,
      },
    },
    {
      type: 'string',
      label: 'Summit Coordinates',
      name: 'summitCoords',
      description: 'Latitude, longitude coordinates for route summit (e.g. "47.447334, -120.992787")',
    },
    {
      type: 'string',
      label: 'CalTopo URL',
      name: 'calTopoUrl',
      description: 'Link to CalTopo map',
    },
    {
      type: 'string',
      label: 'GPX File',
      name: 'gpxFile',
      description: 'Upload GPX file for route',
    },
    {
      type: 'string',
      label: 'Mountain Forecast URL',
      name: 'mountainForecastUrl',
      description: 'Link to weather forecast for this route',
    },
    {
      type: 'rich-text',
      label: 'Body',
      name: '_body',
      isBody: true,
      templates: [
        {
          name: 'RouteOverlay',
          label: 'Route Overlay',
          fields: [
            {
              type: 'string',
              name: 'imageSrc',
              label: 'Image URL',
              required: true,
            },
            {
              type: 'string',
              name: 'topoData',
              label: 'Topo Data (JSON)',
              required: true,
              ui: {
                component: 'textarea',
              },
            },
            {
              type: 'string',
              name: 'topoOverlaySrc',
              label: 'Topo Overlay Image (Base64)',
              ui: {
                component: 'textarea',
              },
            },
          ],
        },
      ],
    },
  ],
};

export default Route;