# Carousel Management System

A complete CRUD (Create, Read, Update, Delete) carousel management system built with Redux state management.

## Features

✅ **Full CRUD Operations**
- Create new carousel items
- Read/View all carousel items
- Update existing items
- Delete items with confirmation

✅ **Redux State Management**
- Centralized state with Redux Toolkit
- Type-safe with TypeScript
- Optimistic UI updates

✅ **Modal Form**
- Beautiful dialog for add/edit operations
- Form validation with Zod
- Formik for form state management

✅ **Image Upload**
- Drag & drop or click to upload
- Image preview
- File type and size validation
- Ready for backend integration

✅ **Search & Filter**
- Real-time search across name, title, and description
- Instant results

✅ **Responsive Design**
- Grid layout adapts to screen size
- Mobile-friendly interface
- Dark mode support

## File Structure

```
src/
├── store/
│   ├── store.ts                 # Redux store configuration
│   ├── hooks.ts                 # Typed Redux hooks
│   ├── ReduxProvider.tsx        # Redux Provider wrapper
│   └── slices/
│       └── carouselSlice.ts     # Carousel state slice
├── components/
│   └── CarouselModal.tsx        # Add/Edit modal component
└── app/
    ├── layout.tsx               # Root layout with Redux Provider
    └── admin/
        └── carousel/
            └── page.tsx         # Main carousel management page
```

## Redux State Structure

```typescript
interface CarouselState {
  items: CarouselItem[];         // Array of carousel items
  isModalOpen: boolean;          // Modal visibility state
  editingItem: CarouselItem | null;  // Item being edited
  loading: boolean;              // Loading state
}

interface CarouselItem {
  id: string;
  name: string;
  photo: string;                 // Image URL or base64
  title: string;
  description: string;
  createdAt: string;
}
```

## Backend Integration

### Required API Endpoints

1. **GET /api/carousel**
   - Fetch all carousel items
   - Returns: `CarouselItem[]`

2. **POST /api/carousel**
   - Create new carousel item
   - Body: `{ name, photo, title, description }`
   - Returns: `CarouselItem`

3. **PUT /api/carousel/:id**
   - Update existing item
   - Body: `{ name, photo, title, description }`
   - Returns: `CarouselItem`

4. **DELETE /api/carousel/:id**
   - Delete carousel item
   - Returns: `{ success: true }`

5. **POST /api/upload** (optional)
   - Upload image file
   - Body: FormData with file
   - Returns: `{ url: string }`

### Integration Steps

1. Update API endpoints in:
   - `src/app/admin/carousel/page.tsx` (lines 31, 56)
   - `src/components/CarouselModal.tsx` (lines 48, 127)

2. Implement image upload:
   - Replace base64 encoding with actual upload to cloud storage
   - Update `handleImageChange` in CarouselModal.tsx (line 127)

3. Add authentication:
   - Add auth headers to fetch requests
   - Implement authorization checks

## Usage

### Adding a New Item

1. Click "Add New Item" button
2. Upload an image
3. Fill in name, title, and description
4. Click "Add Item"

### Editing an Item

1. Click "Edit" button on any item card
2. Modify the fields
3. Click "Update Item"

### Deleting an Item

1. Click "Delete" button on any item card
2. Confirm deletion in the dialog
3. Item is removed from the list

### Searching

- Type in the search bar to filter items
- Search works across name, title, and description fields

## Customization

### Styling

- All components use Shadcn UI components
- Tailwind CSS for styling
- Dark mode supported by default

### Validation

- Edit validation rules in `carouselSchema` (CarouselModal.tsx)
- Current rules:
  - Name: Required
  - Title: Required
  - Description: Minimum 10 characters
  - Photo: Required

### Image Upload

Current implementation uses base64 encoding (not recommended for production).

**For production:**

```typescript
// Example with cloud storage
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const { url } = await response.json();
formik.setFieldValue('photo', url);
```

## Dependencies

- `@reduxjs/toolkit` - Redux state management
- `react-redux` - React bindings for Redux
- `formik` - Form state management
- `zod` - Schema validation
- `zod-formik-adapter` - Zod + Formik integration
- `react-hot-toast` - Toast notifications

## Notes

- Current implementation includes mock data handling
- Replace fetch URLs with your actual backend endpoints
- Image upload is currently base64 (replace with proper file upload)
- Add authentication/authorization as needed
- Consider adding pagination for large datasets
- Consider adding sorting options
- Add loading states for better UX

## Next Steps

1. ✅ Set up your backend API endpoints
2. ✅ Configure image upload service (e.g., AWS S3, Cloudinary)
3. ✅ Update API URLs in the code
4. ✅ Test all CRUD operations
5. ✅ Add authentication
6. ✅ Deploy to production
