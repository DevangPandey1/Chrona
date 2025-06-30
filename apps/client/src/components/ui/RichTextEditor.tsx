'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Button from './Button';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-600 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-800">
      <Button
        variant="secondary"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`text-xs px-2 py-1 ${editor.isActive('bold') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
      >
        Bold
      </Button>
      <Button
        variant="secondary"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`text-xs px-2 py-1 ${editor.isActive('italic') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
      >
        Italic
      </Button>
      <Button
        variant="secondary"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`text-xs px-2 py-1 ${editor.isActive('underline') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
      >
        Underline
      </Button>
      <Button
        variant="secondary"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`text-xs px-2 py-1 ${editor.isActive('strike') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
      >
        Strike
      </Button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      <Button
        variant="secondary"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`text-xs px-2 py-1 ${editor.isActive('heading', { level: 1 }) ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
      >
        H1
      </Button>
      <Button
        variant="secondary"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`text-xs px-2 py-1 ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
      >
        H2
      </Button>
      <Button
        variant="secondary"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`text-xs px-2 py-1 ${editor.isActive('heading', { level: 3 }) ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
      >
        H3
      </Button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      <Button
        variant="secondary"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`text-xs px-2 py-1 ${editor.isActive('bulletList') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
      >
        Bullet List
      </Button>
      <Button
        variant="secondary"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`text-xs px-2 py-1 ${editor.isActive('orderedList') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
      >
        Numbered List
      </Button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      <Button
        variant="secondary"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`text-xs px-2 py-1 ${editor.isActive({ textAlign: 'left' }) ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
      >
        Left
      </Button>
      <Button
        variant="secondary"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`text-xs px-2 py-1 ${editor.isActive({ textAlign: 'center' }) ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
      >
        Center
      </Button>
      <Button
        variant="secondary"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`text-xs px-2 py-1 ${editor.isActive({ textAlign: 'right' }) ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
      >
        Right
      </Button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      <Button
        variant="secondary"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`text-xs px-2 py-1 ${editor.isActive('blockquote') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
      >
        Quote
      </Button>
      <Button
        variant="secondary"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`text-xs px-2 py-1 ${editor.isActive('codeBlock') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
      >
        Code Block
      </Button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing...', className = '' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 ${className}`}>
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="prose dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none text-gray-900 dark:text-white"
      />
    </div>
  );
} 