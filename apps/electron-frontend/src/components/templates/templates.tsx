import { useEffect } from 'react';
import { Template, useTemplatesState } from './template-state';
import styles from './templates.style.module.scss';

const Templates = () => {
  const {templates, onInit} = useTemplatesState();
  
  useEffect(() => {
    onInit();
  }, []);

  console.log(templates);
  return (
    <div className={styles.templates}>
      <h2>Templates</h2>
      <div className="template-card-list">
        {templates.map((template) => {
          return <TemplateCard key={template.name} template={template} />
        })}
      </div>
    </div>
  )
}

function TemplateCard(props: {
  template: Template
}) {
  const {template} = props;
  return (
    <div className="template-card">
      <div className="image">
        {template.thumbnail && <img src={template.thumbnail} />}
      </div>
      <div className="name">{template.name}</div>
    </div>
  )
}

export default Templates;
