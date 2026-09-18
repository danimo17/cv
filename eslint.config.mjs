// @ts-check
import prettier from 'eslint-config-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

const STYLE_UTILITIES =
  '/^(bg|text|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|rounded|border|shadow|font|w|h|max-w|max-h|size)-/'

const PRIMITIVE_WRAPPERS = [
  'CustomText',
  'CustomInput',
  'CustomButton',
  'CustomLink',
  'CustomImage',
  'CustomIcon',
]
const RESTRICTED_ELEMENTS = [
  {
    element: [
      'p',
      'span',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'small',
      'strong',
      'em',
      'label',
      'figcaption',
      'time',
    ],
    message: 'Usa <CustomText as="…" variant="…"> (app/components/shared/CustomText.vue).',
  },
  {
    element: ['input', 'select', 'textarea'],
    message: 'Usa <CustomInput type="…"> (app/components/shared/CustomInput.vue).',
  },
  { element: 'button', message: 'Usa <CustomButton> (app/components/shared/CustomButton.vue).' },
  { element: 'a', message: 'Usa <CustomLink to|href> (app/components/shared/CustomLink.vue).' },
  { element: 'img', message: 'Usa <CustomImage> (app/components/shared/CustomImage.vue).' },
]

export default withNuxt(
  prettier,
  {
    rules: {
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/define-macros-order': [
        'error',
        { order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'] },
      ],
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        { registeredComponentsOnly: false },
      ],
      'vue/require-explicit-emits': 'error',
      'vue/no-bare-strings-in-template': 'error',
      'vue/no-restricted-class': ['error', STYLE_UTILITIES],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@fortawesome/vue-fontawesome',
              message: 'Usa <CustomIcon> (app/components/shared/CustomIcon.vue).',
            },
          ],
        },
      ],
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
    },
  },
  {
    files: ['app/**/*.vue'],
    rules: { 'vue/no-restricted-html-elements': ['error', ...RESTRICTED_ELEMENTS] },
  },
  {
    files: PRIMITIVE_WRAPPERS.map((name) => `app/components/shared/${name}.vue`),
    rules: { 'vue/no-restricted-html-elements': 'off' },
  },
  {
    files: ['app/components/shared/CustomIcon.vue', 'app/plugins/fontawesome.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['server/**'],
    rules: { 'no-console': ['error', { allow: ['error', 'warn'] }] },
  },
  {
    files: ['tests/**', 'e2e/**'],
    rules: { 'vue/no-bare-strings-in-template': 'off', 'no-console': 'off' },
  }
)
