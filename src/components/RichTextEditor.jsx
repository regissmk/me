import React from 'react';
import ReactQuill from 'react-quill';

const RichTextEditor = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ],
  };

  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet'
  ];

  return (
    <div className="bg-background rounded-md border border-input">
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange}
        modules={modules}
        formats={formats}
        className="rich-text-editor"
      />
    </div>
  );
};

export default RichTextEditor;