import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  Quote, Link as LinkIcon, Image as ImageIcon, Heading1, Heading2,
  Undo, Redo
} from 'lucide-react';
import { postsService } from '@/services/postsService';
import { toast } from 'sonner';

const MenuBar = ({ editor }) => {
  const addImage = async () => {
    if (!editor) return;
    // ... logic same as before
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error("La imagen debe ser menor a 5MB");
          return;
        }

        const toastId = toast.loading('Subiendo imagen...');
        try {
          const url = await postsService.uploadPostImage(file);
          editor.chain().focus().setImage({ src: url }).run();
          toast.success('Imagen insertada', { id: toastId });
        } catch (error) {
          console.error(error);
          toast.error('Error al subir imagen', { id: toastId });
        }
      }
    };
    input.click();
  };

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      {/* ... buttons ... */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-brand-orange-50 transition-colors ${editor.isActive('bold') ? 'bg-brand-orange-50 text-brand-orange' : 'text-gray-600'}`}
        title="Negrita"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-brand-orange-50 transition-colors ${editor.isActive('italic') ? 'bg-brand-orange-50 text-brand-orange' : 'text-gray-600'}`}
        title="Cursiva"
      >
        <Italic size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded hover:bg-brand-orange-50 transition-colors ${editor.isActive('underline') ? 'bg-brand-orange-50 text-brand-orange' : 'text-gray-600'}`}
        title="Subrayado"
      >
        <UnderlineIcon size={18} />
      </button>
      
      <div className="w-px h-5 bg-gray-300 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded hover:bg-brand-orange-50 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-brand-orange-50 text-brand-orange' : 'text-gray-600'}`}
        title="Título 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded hover:bg-brand-orange-50 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-brand-orange-50 text-brand-orange' : 'text-gray-600'}`}
        title="Título 2"
      >
        <Heading2 size={18} />
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-brand-orange-50 transition-colors ${editor.isActive('bulletList') ? 'bg-brand-orange-50 text-brand-orange' : 'text-gray-600'}`}
        title="Lista de viñetas"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-brand-orange-50 transition-colors ${editor.isActive('orderedList') ? 'bg-brand-orange-50 text-brand-orange' : 'text-gray-600'}`}
        title="Lista ordenada"
      >
        <ListOrdered size={18} />
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1"></div>

      <button
        type="button"
        onClick={setLink}
        className={`p-1.5 rounded hover:bg-brand-orange-50 transition-colors ${editor.isActive('link') ? 'bg-brand-orange-50 text-brand-orange' : 'text-gray-600'}`}
        title="Enlace"
      >
        <LinkIcon size={18} />
      </button>
      <button
        type="button"
        onClick={addImage}
        className="p-1.5 rounded hover:bg-brand-orange-50 transition-colors text-gray-600"
        title="Insertar Imagen"
      >
        <ImageIcon size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded hover:bg-brand-orange-50 transition-colors ${editor.isActive('blockquote') ? 'bg-brand-orange-50 text-brand-orange' : 'text-gray-600'}`}
        title="Cita"
      >
        <Quote size={18} />
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 rounded hover:bg-brand-orange-50 transition-colors text-gray-600 disabled:opacity-40"
        title="Deshacer"
      >
        <Undo size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 rounded hover:bg-brand-orange-50 transition-colors text-gray-600 disabled:opacity-40"
        title="Rehacer"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder = "Escribe aquí..." }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm font-sans focus:outline-none max-w-none min-h-[200px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
