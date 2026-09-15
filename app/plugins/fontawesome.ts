import { config, library } from '@fortawesome/fontawesome-svg-core'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import {
  faArrowLeft,
  faBriefcase,
  faCartShopping,
  faCertificate,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCircleInfo,
  faCircleXmark,
  faCode,
  faDownload,
  faEnvelope,
  faGraduationCap,
  faLanguage,
  faLocationDot,
  faMagnifyingGlass,
  faMoon,
  faPenRuler,
  faRotateLeft,
  faServer,
  faSun,
  faTriangleExclamation,
  faUser,
  faWandMagicSparkles,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

// Només les icones usades entren al bundle. El CSS s'importa a nuxt.config (autoAddCss off evita FOUC en SSR).
export default defineNuxtPlugin(() => {
  config.autoAddCss = false
  library.add(
    faArrowLeft,
    faBriefcase,
    faCartShopping,
    faCertificate,
    faChevronLeft,
    faChevronRight,
    faCircleCheck,
    faCircleInfo,
    faCircleXmark,
    faCode,
    faDownload,
    faEnvelope,
    faGraduationCap,
    faLanguage,
    faLocationDot,
    faMagnifyingGlass,
    faMoon,
    faPenRuler,
    faRotateLeft,
    faServer,
    faSun,
    faTriangleExclamation,
    faUser,
    faWandMagicSparkles,
    faXmark,
    faGithub,
    faLinkedin
  )
})
