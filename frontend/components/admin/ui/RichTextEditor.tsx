'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';

// FontSize custom extension (không có trong Tiptap open-source)
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}
const FontSizeExtension = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el) => el.style.fontSize || null,
          renderHTML: (attrs) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) =>
        chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) =>
        chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

type BtnProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

marked.use({ gfm: true, breaks: true });

function looksLikeMarkdown(text: string): boolean {
  return /^#{1,6}\s|\*\*[\s\S]+?\*\*|^[*\-]\s|\d+\.\s[^\n]|^>\s|^```|\[.+\]\(.+\)/m.test(text.trim());
}

function Btn({ onClick, active, title, children, style }: BtnProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      style={{
        background: active ? 'var(--t-accent)' : 'transparent',
        color: active ? 'var(--t-nav-active-text)' : 'var(--t-text)',
        border: '1px solid var(--t-border)',
        borderRadius: '5px',
        padding: '0 7px',
        minWidth: '28px',
        height: '28px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3px',
        flexShrink: 0,
        transition: 'background 0.1s, color 0.1s',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return (
    <div style={{ width: '1px', height: '20px', background: 'var(--t-border)', margin: '0 3px', flexShrink: 0 }} />
  );
}

function code(s: string) {
  return (
    <code style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)', borderRadius: '3px', padding: '0 4px', fontSize: '11px', fontFamily: 'monospace' }}>
      {s}
    </code>
  );
}

export default function RichTextEditor({ value, onChange, placeholder = 'Nhập nội dung bài viết...' }: Props) {
  const [showMd, setShowMd] = useState(false);
  const [mdText, setMdText] = useState('');
  const [pasteMsg, setPasteMsg] = useState('');
  const colorRef = useRef<HTMLInputElement>(null);

  // Link panel
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Image panel
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      Highlight,
      TextStyle,
      Color,
      FontFamily,
      FontSizeExtension,
      Subscript,
      Superscript,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: { class: 'tiptap-body' },
    },
  });

  // Sync value khi load từ API
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Tự động chuyển đổi Markdown khi dán vào editor (không có HTML clipboard)
  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const handler = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text/plain') ?? '';
      const hasHtml = e.clipboardData?.types.includes('text/html');
      if (!hasHtml && looksLikeMarkdown(text)) {
        e.preventDefault();
        const html = marked.parse(text) as string;
        editor.commands.insertContent(html);
        setPasteMsg('✓ Đã tự động chuyển đổi Markdown được dán vào');
        setTimeout(() => setPasteMsg(''), 4000);
      }
    };
    dom.addEventListener('paste', handler);
    return () => dom.removeEventListener('paste', handler);
  }, [editor]);

  const openLinkPanel = () => {
    if (showLink) { setShowLink(false); return; }
    setLinkUrl(editor?.getAttributes('link').href ?? '');
    setShowImage(false);
    setShowMd(false);
    setShowLink(true);
    setTimeout(() => linkInputRef.current?.focus(), 50);
  };

  const applyLink = () => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLink(false);
    setLinkUrl('');
  };

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
    setShowLink(false);
    setLinkUrl('');
  };

  const openImagePanel = () => {
    if (showImage) { setShowImage(false); return; }
    setShowLink(false);
    setShowMd(false);
    setShowImage(true);
    setTimeout(() => imageInputRef.current?.focus(), 50);
  };

  const applyImage = () => {
    if (!editor || !imageUrl.trim()) return;
    const attrs: { src: string; alt?: string } = { src: imageUrl.trim() };
    if (imageAlt.trim()) attrs.alt = imageAlt.trim();
    editor.chain().focus().setImage(attrs).run();
    setShowImage(false);
    setImageUrl('');
    setImageAlt('');
  };

  const convertMd = (mode: 'insert' | 'replace') => {
    if (!mdText.trim() || !editor) return;
    const html = marked.parse(mdText) as string;
    if (mode === 'replace') {
      editor.commands.setContent(html);
    } else {
      editor.commands.focus('end');
      editor.commands.insertContent(html);
    }
    setMdText('');
    setShowMd(false);
  };

  const currentColor = editor?.getAttributes('textStyle').color as string | undefined;
  const currentFontFamily = editor?.getAttributes('textStyle').fontFamily as string | undefined;
  const currentFontSize = editor?.getAttributes('textStyle').fontSize as string | undefined;
  const wordCount = editor ? (editor.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0) : 0;
  const charCount = editor?.getText().length ?? 0;

  if (!editor) return null;

  const surface2 = 'var(--t-surface-2)';
  const border = 'var(--t-border)';
  const accent = 'var(--t-accent)';

  return (
    <div style={{ border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden', background: 'var(--t-surface)' }}>

      {/* ═══ TOOLBAR ═══════════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '3px',
        padding: '8px 10px',
        borderBottom: `1px solid ${border}`,
        background: surface2,
        alignItems: 'center',
      }}>

        {/* Lịch sử */}
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Hoàn tác (Ctrl+Z)">↩</Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Làm lại (Ctrl+Y)">↪</Btn>
        <Sep />

        {/* Font chữ */}
        <select
          title="Kiểu font chữ"
          value={currentFontFamily ?? ''}
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setFontFamily(e.target.value).run();
            } else {
              editor.chain().focus().unsetFontFamily().run();
            }
          }}
          style={selStyle(140)}
        >
          <option value="">— Font mặc định —</option>
          <optgroup label="Serif">
            <option value="Georgia, serif">Georgia</option>
            <option value="'Times New Roman', Times, serif">Times New Roman</option>
            <option value="'Palatino Linotype', Palatino, serif">Palatino</option>
            <option value="'Cormorant Garamond', Georgia, serif">Cormorant Garamond</option>
          </optgroup>
          <optgroup label="Sans-serif">
            <option value="Arial, Helvetica, sans-serif">Arial</option>
            <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
            <option value="Verdana, Geneva, sans-serif">Verdana</option>
            <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
            <option value="'Segoe UI', system-ui, sans-serif">Segoe UI</option>
          </optgroup>
          <optgroup label="Monospace">
            <option value="'Courier New', Courier, monospace">Courier New</option>
            <option value="'Lucida Console', Monaco, monospace">Lucida Console</option>
          </optgroup>
        </select>

        {/* Cỡ chữ */}
        <select
          title="Cỡ chữ (font size)"
          value={currentFontSize ?? ''}
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setFontSize(e.target.value).run();
            } else {
              editor.chain().focus().unsetFontSize().run();
            }
          }}
          style={selStyle(68)}
        >
          <option value="">Cỡ</option>
          {[8,9,10,11,12,13,14,15,16,18,20,22,24,26,28,32,36,40,48,56,64,72].map(s => (
            <option key={s} value={`${s}px`}>{s}</option>
          ))}
        </select>
        <Sep />

        {/* Kiểu khối */}
        <Btn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph') && !editor.isActive('heading')} title="Đoạn văn">¶</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Tiêu đề lớn H2">H2</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Tiêu đề vừa H3">H3</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive('heading', { level: 4 })} title="Tiêu đề nhỏ H4">H4</Btn>
        <Sep />

        {/* Định dạng chữ */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="In đậm (Ctrl+B)">
          <strong>B</strong>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="In nghiêng (Ctrl+I)">
          <em>I</em>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Gạch chân (Ctrl+U)">
          <span style={{ textDecoration: 'underline' }}>U</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Gạch ngang">
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code nội dòng">
          {'`x`'}
        </Btn>
        <Sep />

        {/* Tô sáng + màu chữ */}
        <Btn
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive('highlight')}
          title="Tô sáng văn bản"
        >
          <span style={{
            background: 'color-mix(in oklch, var(--t-warning) 30%, transparent)',
            borderRadius: '2px', padding: '0 3px',
            color: editor.isActive('highlight') ? 'var(--t-nav-active-text)' : 'var(--t-text)',
          }}>
            H
          </span>
        </Btn>

        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <input
            type="color"
            ref={colorRef}
            defaultValue="#8B0000"
            style={{ position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
            onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
          />
          <Btn onClick={() => colorRef.current?.click()} title="Màu chữ — chọn màu tùy ý">
            <span style={{ borderBottom: `2.5px solid ${currentColor ?? 'var(--t-text)'}`, lineHeight: 1.3 }}>A</span>
          </Btn>
        </div>
        <Btn
          onClick={() => editor.chain().focus().unsetColor().run()}
          title="Bỏ màu chữ về mặc định"
          style={{ fontSize: '10px', padding: '0 5px' }}
        >
          A✕
        </Btn>
        <Sep />

        {/* Chỉ số dưới / trên */}
        <Btn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Chỉ số dưới (x₂)">
          x<sub style={{ fontSize: '9px' }}>2</sub>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Chỉ số trên (x²)">
          x<sup style={{ fontSize: '9px' }}>2</sup>
        </Btn>
        <Sep />

        {/* Căn chỉnh */}
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Căn trái">⬅</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Căn giữa">↔</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Căn phải">➡</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Căn đều hai bên">⇔</Btn>
        <Sep />

        {/* Danh sách + khối */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách chấm">•≡</Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sách số">1≡</Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title='Khối trích dẫn'>"</Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Khối code">{'{ }'}</Btn>
        <Sep />

        {/* Chèn */}
        <Btn onClick={openLinkPanel} active={showLink || editor.isActive('link')} title="Chèn / chỉnh liên kết">🔗</Btn>
        <Btn onClick={openImagePanel} active={showImage} title="Chèn hình ảnh">🖼</Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Chèn đường kẻ ngang">—</Btn>
        <Sep />

        {/* Xóa định dạng */}
        <Btn
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Xóa toàn bộ định dạng của đoạn đang chọn"
          style={{ fontSize: '11px', padding: '0 8px' }}
        >
          ✕ fmt
        </Btn>

        {/* Đẩy nút Nhập MD sang phải */}
        <div style={{ flex: 1 }} />

        {/* Nút nhập Markdown — nổi bật */}
        <Btn
          onClick={() => { setShowLink(false); setShowImage(false); setShowMd(!showMd); }}
          active={showMd}
          title="Nhập / chuyển đổi nội dung từ Markdown (ChatGPT, file .md) hoặc dán văn bản thô"
          style={{
            padding: '0 12px',
            gap: '5px',
            background: showMd
              ? accent
              : 'color-mix(in oklch, var(--t-accent) 10%, transparent)',
            color: showMd ? 'var(--t-nav-active-text)' : accent,
            borderColor: 'color-mix(in oklch, var(--t-accent) 35%, transparent)',
            fontWeight: 600,
            fontSize: '11px',
          }}
        >
          <span>📥</span>
          <span>Nhập MD</span>
        </Btn>
      </div>

      {/* ═══ PANEL LINK ════════════════════════════════════════════════════ */}
      {showLink && (
        <div style={{
          borderBottom: `1px solid ${border}`,
          background: surface2,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t-text-2)', flexShrink: 0 }}>🔗 URL liên kết:</span>
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
              if (e.key === 'Escape') setShowLink(false);
            }}
            placeholder="https://example.com"
            style={{
              flex: 1, minWidth: '220px',
              border: `1px solid color-mix(in oklch, ${accent} 50%, ${border})`,
              borderRadius: '6px', padding: '5px 10px',
              fontSize: '13px', background: 'var(--t-surface)',
              color: 'var(--t-text)', outline: 'none',
            }}
          />
          <button
            type="button" onClick={applyLink}
            style={{ padding: '5px 14px', borderRadius: '6px', border: 'none', background: accent, color: 'var(--t-nav-active-text)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          >
            Áp dụng
          </button>
          {editor.isActive('link') && (
            <button
              type="button" onClick={removeLink}
              style={{ padding: '5px 12px', borderRadius: '6px', border: `1px solid color-mix(in oklch, var(--t-error) 40%, ${border})`, background: 'color-mix(in oklch, var(--t-error) 8%, transparent)', color: 'var(--t-error)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}
            >
              Xóa liên kết
            </button>
          )}
          <button
            type="button" onClick={() => setShowLink(false)}
            style={{ padding: '5px 8px', borderRadius: '6px', border: `1px solid ${border}`, background: 'transparent', color: 'var(--t-text-3)', fontSize: '14px', cursor: 'pointer', lineHeight: 1, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ═══ PANEL HÌNH ẢNH ════════════════════════════════════════════════ */}
      {showImage && (
        <div style={{
          borderBottom: `1px solid ${border}`,
          background: surface2,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t-text-2)', flexShrink: 0 }}>🖼 Hình ảnh:</span>
          <input
            ref={imageInputRef}
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); applyImage(); }
              if (e.key === 'Escape') setShowImage(false);
            }}
            placeholder="URL hình ảnh (https://...)"
            style={{
              flex: 2, minWidth: '200px',
              border: `1px solid color-mix(in oklch, ${accent} 50%, ${border})`,
              borderRadius: '6px', padding: '5px 10px',
              fontSize: '13px', background: 'var(--t-surface)',
              color: 'var(--t-text)', outline: 'none',
            }}
          />
          <input
            type="text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); applyImage(); }
              if (e.key === 'Escape') setShowImage(false);
            }}
            placeholder="Mô tả hình (alt, tùy chọn)"
            style={{
              flex: 1, minWidth: '150px',
              border: `1px solid ${border}`,
              borderRadius: '6px', padding: '5px 10px',
              fontSize: '13px', background: 'var(--t-surface)',
              color: 'var(--t-text)', outline: 'none',
            }}
          />
          <button
            type="button" onClick={applyImage}
            disabled={!imageUrl.trim()}
            style={{ padding: '5px 14px', borderRadius: '6px', border: 'none', background: accent, color: 'var(--t-nav-active-text)', fontSize: '12px', fontWeight: 600, cursor: imageUrl.trim() ? 'pointer' : 'not-allowed', opacity: imageUrl.trim() ? 1 : 0.45, flexShrink: 0 }}
          >
            Chèn hình
          </button>
          <button
            type="button" onClick={() => setShowImage(false)}
            style={{ padding: '5px 8px', borderRadius: '6px', border: `1px solid ${border}`, background: 'transparent', color: 'var(--t-text-3)', fontSize: '14px', cursor: 'pointer', lineHeight: 1, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ═══ PANEL NHẬP MARKDOWN ═══════════════════════════════════════════ */}
      {showMd && (
        <div style={{
          borderBottom: `1px solid ${border}`,
          background: 'color-mix(in oklch, var(--t-accent) 4%, var(--t-surface))',
          padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t-text)', marginBottom: '4px' }}>
                📝 Nhập nội dung Markdown hoặc văn bản thô
              </div>
              <div style={{ fontSize: '12px', color: 'var(--t-text-3)', lineHeight: 1.6 }}>
                Hỗ trợ: {code('# Tiêu đề')} {code('**đậm**')} {code('*nghiêng*')} {code('- danh sách')} {code('> trích dẫn')} {code('`code`')} {code('[text](url)')}<br />
                Dán nội dung từ <strong>ChatGPT</strong>, file <strong>.md</strong>, hoặc copy từ <strong>Google Docs / Word</strong>.
                Bạn cũng có thể dán thẳng vào vùng soạn thảo — Markdown sẽ tự động chuyển đổi.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowMd(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t-text-3)', fontSize: '18px', lineHeight: 1, padding: '0 0 0 12px', flexShrink: 0 }}
            >
              ✕
            </button>
          </div>

          <textarea
            value={mdText}
            onChange={(e) => setMdText(e.target.value)}
            rows={8}
            placeholder={`Dán nội dung vào đây, ví dụ:\n\n# Tiêu đề bài viết\n\nĐây là đoạn mở đầu.\n\n## Phần 1\n\n- Mục một\n- Mục hai\n\n> Trích dẫn quan trọng...`}
            style={{
              width: '100%',
              resize: 'vertical',
              border: `1px solid ${border}`,
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '13px',
              fontFamily: 'ui-monospace, monospace',
              background: 'var(--t-surface)',
              color: 'var(--t-text)',
              outline: 'none',
              boxSizing: 'border-box',
              lineHeight: 1.55,
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--t-text-3)' }}>
              💡 Word/Google Docs: copy → dán thẳng vào editor, định dạng sẽ được giữ nguyên tự động.
            </span>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => convertMd('insert')}
                disabled={!mdText.trim()}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  border: `1px solid ${border}`,
                  background: surface2,
                  color: 'var(--t-text)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: mdText.trim() ? 'pointer' : 'not-allowed',
                  opacity: mdText.trim() ? 1 : 0.45,
                  transition: 'opacity 0.15s',
                }}
              >
                + Chèn vào cuối bài
              </button>
              <button
                type="button"
                onClick={() => convertMd('replace')}
                disabled={!mdText.trim()}
                style={{
                  padding: '6px 16px',
                  borderRadius: '7px',
                  border: 'none',
                  background: accent,
                  color: 'var(--t-nav-active-text)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: mdText.trim() ? 'pointer' : 'not-allowed',
                  opacity: mdText.trim() ? 1 : 0.45,
                  transition: 'opacity 0.15s',
                }}
              >
                ↻ Thay thế nội dung
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ THÔNG BÁO PASTE TỰ ĐỘNG ══════════════════════════════════════ */}
      {pasteMsg && (
        <div style={{
          padding: '6px 14px',
          background: 'color-mix(in oklch, var(--t-success) 10%, var(--t-surface))',
          borderBottom: `1px solid color-mix(in oklch, var(--t-success) 25%, transparent)`,
          fontSize: '12px',
          color: 'var(--t-success)',
          fontWeight: 500,
        }}>
          {pasteMsg}
        </div>
      )}

      {/* ═══ VÙNG SOẠN THẢO ════════════════════════════════════════════════ */}
      <EditorContent editor={editor} />

      {/* ═══ FOOTER: đếm từ + phím tắt ════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '5px 14px',
        borderTop: `1px solid ${border}`,
        background: surface2,
        fontSize: '11px',
        color: 'var(--t-text-3)',
        flexWrap: 'wrap',
        gap: '6px',
      }}>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {wordCount} từ · {charCount} ký tự
        </span>
        <span>
          <kbd style={kbdStyle}>Ctrl+B</kbd> đậm ·{' '}
          <kbd style={kbdStyle}>Ctrl+I</kbd> nghiêng ·{' '}
          <kbd style={kbdStyle}>Ctrl+U</kbd> gạch chân ·{' '}
          <kbd style={kbdStyle}>Ctrl+Z</kbd> hoàn tác
        </span>
      </div>

      {/* ═══ STYLES ════════════════════════════════════════════════════════ */}
      <style>{`
        .tiptap-body {
          min-height: 320px;
          padding: 18px 20px;
          font-size: 14px;
          line-height: 1.8;
          color: var(--t-text);
          outline: none;
        }
        .tiptap-body:focus { outline: none; }
        .tiptap-body > * + * { margin-top: 0.55em; }
        .tiptap-body h2 {
          font-size: 1.5em; font-weight: 700;
          color: var(--t-text); margin-top: 1.3em; margin-bottom: 0.3em;
          border-bottom: 1px solid var(--t-border); padding-bottom: 0.2em;
        }
        .tiptap-body h3 { font-size: 1.25em; font-weight: 700; color: var(--t-text); margin-top: 1.1em; margin-bottom: 0.25em; }
        .tiptap-body h4 { font-size: 1.05em; font-weight: 600; color: var(--t-text); margin-top: 0.9em; margin-bottom: 0.2em; }
        .tiptap-body p { margin: 0; }
        .tiptap-body ul { list-style: disc; padding-left: 1.6em; margin: 0; }
        .tiptap-body ol { list-style: decimal; padding-left: 1.6em; margin: 0; }
        .tiptap-body li { margin: 0.15em 0; }
        .tiptap-body li > p { margin: 0; }
        .tiptap-body blockquote {
          border-left: 3px solid var(--t-accent);
          padding: 4px 0 4px 14px;
          margin: 0.5em 0;
          color: var(--t-text-2);
          font-style: italic;
          background: color-mix(in oklch, var(--t-accent) 4%, transparent);
          border-radius: 0 4px 4px 0;
        }
        .tiptap-body code {
          background: var(--t-surface-2);
          border: 1px solid var(--t-border);
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 0.86em;
          font-family: ui-monospace, 'Cascadia Code', monospace;
          color: var(--t-accent);
        }
        .tiptap-body pre {
          background: var(--t-surface-2);
          border: 1px solid var(--t-border);
          border-radius: 8px;
          padding: 12px 16px;
          overflow-x: auto;
          margin: 0.5em 0;
        }
        .tiptap-body pre code {
          background: none; border: none; padding: 0;
          font-size: 0.86em; color: var(--t-text);
        }
        .tiptap-body a { color: var(--t-accent); text-decoration: underline; text-underline-offset: 2px; }
        .tiptap-body hr { border: none; border-top: 1px solid var(--t-border); margin: 1em 0; }
        .tiptap-body img { max-width: 100%; border-radius: 8px; display: block; margin: 0.6em 0; }
        .tiptap-body mark {
          background: color-mix(in oklch, var(--t-warning) 28%, transparent);
          border-radius: 2px;
          padding: 0 2px;
        }
        .tiptap-body .ProseMirror-focused { outline: none; }
        .tiptap-body p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--t-text-3);
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>
    </div>
  );
}

const kbdStyle: React.CSSProperties = {
  background: 'var(--t-surface)',
  border: '1px solid var(--t-border)',
  borderRadius: '3px',
  padding: '0 4px',
  fontSize: '10px',
  fontFamily: 'inherit',
};

function selStyle(width: number): React.CSSProperties {
  return {
    height: '28px',
    width: `${width}px`,
    border: '1px solid var(--t-border)',
    borderRadius: '5px',
    padding: '0 4px',
    fontSize: '12px',
    background: 'var(--t-surface-2)',
    color: 'var(--t-text)',
    cursor: 'pointer',
    outline: 'none',
    flexShrink: 0,
  };
}
