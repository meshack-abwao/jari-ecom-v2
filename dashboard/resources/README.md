# App Resources

This folder contains source images for app icons and splash screens.

## Required Files

### App Icon
- `icon.png` - 1024x1024 PNG (no transparency for iOS)
- Used to generate all icon sizes for Android and iOS

### Splash Screen  
- `splash.png` - 2732x2732 PNG (centered logo on solid background)
- Used to generate all splash screen sizes

## Generating Icons

After adding icon.png and splash.png, run:

```bash
# Install the resource generator
npm install -g @capacitor/assets

# Generate all icons and splash screens
npx capacitor-assets generate
```

This will automatically create all required sizes in:
- `android/app/src/main/res/mipmap-*` (icons)
- `android/app/src/main/res/drawable-*` (splash)

## Current Status
- [ ] icon.png - Need 1024x1024 Jari logo
- [ ] splash.png - Need splash with Jari branding
