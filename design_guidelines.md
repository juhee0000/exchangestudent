# Design Guidelines: 교환마켓 (Exchange Market)

## Design Approach
**Hybrid Approach**: Material Design foundations with Korean marketplace references (Karrot, Bungaejangter). Mobile-first utility app requiring visual warmth for community trust.

## Typography
- **Primary Font**: Noto Sans KR (Google Fonts)
- **Headers**: Bold (700) - 24px mobile, 32px tablet+
- **Body**: Regular (400) - 16px mobile, 18px desktop
- **Labels/Meta**: Medium (500) - 14px
- **CTA Text**: SemiBold (600) - 16px

## Layout System
**Tailwind Spacing**: Use units 2, 3, 4, 6, 8, 12, 16
- **Container**: max-w-md centered (mobile-first)
- **Section Padding**: py-6 mobile, py-8 desktop
- **Card Spacing**: gap-4 for grids, p-4 inside cards
- **Element Gaps**: space-y-3 for stacked content

## Core Components

### Navigation & Headers
**Fixed Top Header**: 
- Search icon (right), menu/back (left), logo/title (center)
- Height: h-16, backdrop-blur-xl, shadow-sm
- Sticky positioning with white/glass background

**Bottom Navigation** (5 tabs):
- Icons: 홈, 거래, 커뮤니티, 모임, 마이
- h-16, safe-area-inset-bottom padding
- Active state: filled icon + primary text

### Search Results Page
**Search Bar Component**:
- Prominent at top with filter icon, magnifying glass icon
- Rounded-full input field with subtle shadow
- Filter chips below (카테고리, 가격, 거리, 최신순)

**Result Cards** (2-column grid on mobile):
- Aspect-ratio-square product images
- Overlay: Price tag (top-left, blurred background)
- Below image: Title (truncate 2 lines), location/time (text-sm, muted)
- Divider between rows: border-t

### Item Cards
**Marketplace Listings**:
- Card with rounded-2xl, shadow-md
- Image aspect-ratio 4:3, object-cover
- Badge overlays: "예약중", "거래완료" (blurred backgrounds)
- Content: p-4 with title, price (bold, large), user avatar + name, view count

### Community Posts
**Feed Style**:
- Avatar + username + timestamp header
- Text content with "더보기" expansion
- Image gallery: first image full-width, thumbnails below
- Actions bar: 좋아요, 댓글, 공유 icons with counts

### Meeting Cards
**Event Listings**:
- Horizontal card layout (image left, content right)
- Date badge (absolute top-right, blurred background)
- Participant avatars stack (max 3 visible + count)
- Join button: full-width, rounded-lg

## Images

**Hero Image**: No traditional hero - this is utility-focused. 

**Product Images**: 
- Required for all item listings (aspect 1:1 or 4:3)
- Support multiple images with dot indicators
- Lazy loading for feed performance

**User Avatars**: 
- Circular, w-10 h-10 standard
- Border-2 for verified users

**Meeting/Event Images**:
- Landscape orientation (16:9)
- Used as card backgrounds with gradient overlays

**Category Icons**:
- Simple line icons (Heroicons) for filters and categories
- w-6 h-6 standard size

## Key Interactions
- **Pull-to-refresh**: Native mobile pattern for feeds
- **Infinite scroll**: Load more items/posts as user scrolls
- **Tab persistence**: Remember scroll position when switching tabs
- **Image gallery**: Swipeable carousel with indicators
- **Quick filters**: Horizontal scroll chips, toggleable

## Search Results Specifics
- **Empty State**: Illustration + "검색 결과가 없어요" message
- **Loading State**: Skeleton cards (shimmer effect)
- **Recent Searches**: Show below search bar when empty
- **Trending Tags**: Pill-shaped chips with # prefix

## Accessibility
- Touch targets minimum 44x44px
- High contrast text (WCAG AA minimum)
- Korean text needs 1.6 line-height for readability
- Focus states: ring-2 ring-offset-2

**Mobile Optimization**: All tap areas generous, swipe gestures supported, bottom navigation thumb-friendly, safe area insets respected for notched devices.