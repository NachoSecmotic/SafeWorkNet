import React from 'react';
import { injectIntl } from 'react-intl';
import { Input } from 'reactstrap';
import styles from './styles.module.scss';

const {
  containerCVSecForm, fieldForm, msgValidate, labelInline,
} = styles;

function CVSecForm({ fields, className }) {
  const typeLabelSecond = ['checkbox', 'radio'];
  return (
    <form className={`${containerCVSecForm} ${className}`}>
      {fields.map((field) => (
        <div className={`${fieldForm} ${field.classContent}`} key={`${field.id}`}>
          {!typeLabelSecond.includes(field.type) && (
            field.label && <label htmlFor={field.id ?? ''}>{field.label}</label>
          )}
          {(field.type !== 'info' && field.type !== 'external') ? (
            <Input
              type={field.type}
              invalid={!field.disableValidation && !field.valid}
              valid={!field.disableValidation && field.valid}
              id={field.id ?? ''}
              name={field.name ?? ''}
              value={field.value}
              multiple={field.multiple}
              onChange={(e) => field.onChange(e.target)}
              onClick={field.onClick ? () => field.onClick() : () => {}}
              placeholder={field.placeholder ?? ''}
              rows={field.rows ?? null}
              maxLength={field.maxLength ?? null}
            >
              {field.type === 'select' ? (
                Object.entries(field.options).map(([key, value], ind) => (
                  <option
                    key={value}
                    disabled={!ind}
                    value={key}
                    selected={key === field.value}
                  >
                    {value}
                  </option>
                ))) : null}
            </Input>
          )
            : (
              <div>
                {field.value}
              </div>
            )}
          {field.type === 'external' && field.component}
          {typeLabelSecond.includes(field.type) && (
            field.label && <label className={labelInline} htmlFor={field.id ?? ''}>{field.label}</label>
          )}
          {!field.valid && <span className={msgValidate}>{field.msg}</span>}
        </div>
      ))}
    </form>
  );
}

export default injectIntl(CVSecForm);
