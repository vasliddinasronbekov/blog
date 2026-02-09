'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { useEffect } from 'react';

const Editor = ({ content, onUpdate }: { content?: string; onUpdate: (content: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ 
        placeholder: 'Maqolangizni yozishni boshlang... (Markdown qoʻllab-quvvatlanadi)',
        emptyEditorClass: 'is-editor-empty',
      }),
      Image.configure({ inline: true }),
    ],
    content: content || '',
    // MUHIM: SSR xatosini bartaraf etish
    immediatelyRender: false, 
    // Ma'lumot yangilanganda onUpdate funksiyasini chaqirish
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4 cursor-text',
      },
    },
  });

  // Tashqaridan content o'zgarsa (masalan, Edit rejimida)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  return (
    <div className="w-full border rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
      {/* Toolbar - Foydalanuvchi qulayligi uchun oddiy menyu */}
      <div className="bg-gray-50 border-b editor-toolbar">
        <button 
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
          type="button"
        ><b>B</b></button>
        <button 
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
          type="button"
        ><i>I</i></button>
        <button 
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('heading') ? 'bg-gray-200' : ''}`}
          type="button"
        >H2</button>
        <button 
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className="p-2 rounded hover:bg-gray-200"
          type="button"
        >• List</button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
