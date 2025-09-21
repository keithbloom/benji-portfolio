# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Benji Bloom's portfolio website built with Hugo static site generator and styled with Tailwind CSS. The site uses the "hugo-creative-portfolio-theme" theme with extensive Tailwind customizations.

## Architecture

- **Static Site Generator**: Hugo (v0.111.3+)
- **Styling**: Tailwind CSS with custom configurations
- **Theme**: hugo-creative-portfolio-theme (located in `themes/hugo-creative-portfolio-theme/`)
- **Deployment**: Netlify (configuration in `netlify.toml`)
- **Content Structure**:
  - Portfolio items in `content/portfolio/`
  - About page in `content/about/`
  - Contact page in `content/contact/`
  - Posts in `content/posts/`

## Development Commands

```bash
# Start development server with live reload
npm run start                 # Runs both Hugo server and Tailwind watch

# Hugo development server only
npm run dev                   # hugo server

# Tailwind CSS commands
npm run tailwind:watch        # Watch and compile Tailwind CSS
npm run tailwind:build        # Build and minify Tailwind CSS

# Production build
npm run build                 # hugo --minify (builds static site)
```

## Styling System

The project uses a sophisticated Tailwind CSS setup with:

1. **Custom Color Palettes**:
   - Zone colors (zone-40-blue, zone-42-green, etc.)
   - Lusion theme colors (dark, slate, blue, royal, light)
   - Type Terms colors (navy, purple, gray, cyan, teal)

2. **Dynamic Title Styling**:
   - Custom Tailwind plugin generates `.page-head-{1-8}-container` classes
   - Each number corresponds to different color combinations
   - Configured in `tailwind.config.js` under `titleColours`

3. **CSS Structure**:
   - Source: `assets/css/main.css` (Tailwind directives + custom components)
   - Output: `assets/css/style.css` (compiled by Tailwind)
   - Extensive content styling classes for typography, lists, tables, etc.

## Content Management

- **Portfolio Items**: Each item is a markdown file in `content/portfolio/` with frontmatter
- **Page Headers**: Use the dynamic color system with `page-head-{number}` classes
- **Custom Layouts**: Override theme templates in `layouts/` directory
- **Shortcodes**: Custom shortcodes available in `layouts/shortcodes/`

## Theme Customization

The site heavily customizes the base theme:
- Custom layouts in `layouts/` override theme defaults
- Tailwind replaces most theme CSS
- Custom partials in `layouts/partials/`
- Font: Cal Sans (custom font family defined as 'carter')

## Configuration

- **Hugo Config**: `config.toml` - site settings, navigation, theme selection
- **Tailwind Config**: `tailwind.config.js` - custom colors, plugins, safelist
- **PostCSS**: `postcss.config.js` - Tailwind and Autoprefixer
- **Netlify**: `netlify.toml` - build commands and environment settings

## Development Notes

- The build process requires both Tailwind compilation and Hugo build
- Safelist in Tailwind config ensures dynamic classes aren't purged
- Custom Tailwind plugin handles the title color system programmatically
- Google Analytics configured with ID: G-L15E732RKV