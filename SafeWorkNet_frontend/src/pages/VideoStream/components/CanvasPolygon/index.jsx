/* eslint-disable no-param-reassign */
import React, { useState, useEffect, useRef } from 'react';
import { injectIntl } from 'react-intl';
import {
  CaretDownFill, PlusSquare, Pencil, Trash, Floppy,
} from 'react-bootstrap-icons';
import { ProForm, ProFormSelect } from '@ant-design/pro-form';
import CustomButton from '../../../../components/CustomButton';
import CVSecModal from '../../../../components/CVSecModal';
import CVSecForm from '../../../../components/CVSecForm';
import Canvas from './containers/Canvas';
import handDrawing from '../../../../resources/pages/videoStream/edit/handDrawing.svg';
import notAllowed from '../../../../resources/pages/videoStream/edit/notAllowed.svg';
import styles from './styles.module.scss';
import { DEFAULT_RESOLUTION } from '../../../../constants/variables';

const {
  containerCanvas, resourceStyle, activeDraw, disabled, optionsDisabled, newSection,
  bodyModalCanvasPolygon, selectorSections, optionsSections, saveEmptySection,
  hideOption, sectionLi,
} = styles;

const SelectorSections = ({
  sections, sectionSelected, setSectionSelected, isDrawing,
}) => {
  const [showSections, setShowSections] = useState(false);
  const ulRef = useRef(null);
  const polygonsArray = Object.keys(sections);
  let heightOptions = 40;

  if (polygonsArray.length > 1 && ulRef.current) {
    heightOptions = ulRef.current.offsetHeight + 5;
  }

  return (
    <div className={selectorSections}>
      <div className={hideOption}>{sectionSelected}</div>
      <div
        className={`${optionsSections} ${isDrawing ? optionsDisabled : ''}`}
        style={{ height: `${showSections ? heightOptions : '40'}px` }}
      >
        <ul ref={ulRef}>
          <li onClick={!isDrawing ? () => setShowSections((prev) => !prev) : () => {}}>
            {sectionSelected}
            <CaretDownFill />
          </li>
          {polygonsArray.map((sectionName) => {
            if (sectionName !== sectionSelected) {
              return (
                <li
                  key={`limit-${sectionName}`}
                  onClick={!isDrawing ? () => setSectionSelected(sectionName) : () => {}}
                  className={sectionLi}
                >
                  {sectionName}
                </li>
              );
            }
            return null;
          })}
        </ul>
      </div>
    </div>
  );
};

const initialSections = () => ({
  name: { validate: null },
  aiModels: { validate: null },
});

function CanvasPolygon({
  intl, resource, saveSections, sections, setSections, aiModels, getDeviceDimensions,
}) {
  const resourceRef = useRef(null);
  const propFormRef = useRef(null);
  const [enabledDrawing, setEnabledDrawing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showModalNewSection, setShowModalNewSection] = useState(false);
  const [showModalEditSection, setShowModalEditSection] = useState(false);
  const [showModalDeleteSection, setShowModalDeleteSection] = useState(false);
  const [newSections, setNewSections] = useState(initialSections());
  const [sectionSelected, setSectionSelected] = useState();
  const [aiModelsOptions, setAImodelsOptions] = useState([]);
  const [canvasWidth, setCanvasWidth] = useState(DEFAULT_RESOLUTION.width);
  const [canvasHeight, setCanvasHeight] = useState(DEFAULT_RESOLUTION.height);

  useEffect(() => {
    const { width, height } = getDeviceDimensions();

    if (width > 0 && height > 0) {
      const adjustedHeight = DEFAULT_RESOLUTION.height;
      const ratio = height / width;
      const adjustedWidth = Math.min(adjustedHeight / ratio, DEFAULT_RESOLUTION.width);
      setCanvasWidth(adjustedWidth);
      setCanvasHeight(adjustedHeight);
    }
  }, [getDeviceDimensions]);

  const validateField = (field, value, trigger, isEditing) => {
    switch (field) {
      case 'name': {
        let validate;
        let msg;

        validate = value.trim().length >= 5 && value.trim().length < 20;
        if (!validate) {
          msg = intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.modal.updateSection.error.name' });
        } else {
          if (isEditing) {
            validate = (value.trim() === sectionSelected)
              ? true
              : !Object.keys(sections).includes(value.trim());
          } else {
            validate = !Object.keys(sections).includes(value.trim());
          }

          if (!validate) {
            msg = intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.modal.updateSection.error.name.duplicate' });
          }
        }

        trigger((prev) => ({
          ...prev,
          [field]: {
            value, validate, msg,
          },
        }));
      }
        break;
      case 'aiModels': trigger((prev) => ({
        ...prev,
        [field]: {
          value,
          validate: value.length > 0,
          msg: intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.modal.updateSection.error.aiModels' }),
        },
      }));
        break;
      default: console.error('Error frontend');
        break;
    }
  };

  const addAImodelsOption = (aiModelsToAdd) => {
    const newOptions = [];
    aiModelsToAdd.forEach((model) => {
      const [, second] = model.split('/');
      newOptions.push({
        label: second,
        value: model,
      });
    });
    setAImodelsOptions(newOptions);
  };

  useEffect(() => {
    const isNotEmpty = aiModels?.length;
    if (isNotEmpty) {
      addAImodelsOption(aiModels);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiModels, intl]);

  const getBodyModal = (isEditing) => {
    let fields = [];

    fields = [
      {
        type: 'text',
        label: intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.modal.newSection.name' }),
        id: 'inputNameNewSection',
        value: newSections.name.value,
        placeholder: intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.modal.newSection.name.placeholder' }),
        disableValidation: newSections.name.validate === null,
        valid: newSections.name.validate,
        msg: newSections.name.msg,
        maxLength: 20,
        onChange: (input) => validateField('name', input.value, setNewSections, isEditing),
      },
      {
        type: 'external',
        id: 'selectMultiple',
        component: (
          <ProForm
            formRef={propFormRef}
            initialValues={{ aiModelsCanvas: newSections.aiModels.value }}
            submitter={{
              submitButtonProps: { style: { display: 'none' } },
              resetButtonProps: { style: { display: 'none' } },
            }}
          >
            <ProFormSelect
              name="aiModelsCanvas"
              className="selectANTD"
              label={intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.modal.newSection.aiModels' })}
              placeholder={intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.modal.newSection.aiModels.placeholder' })}
              mode="multiple"
              options={aiModelsOptions}
              onChange={(optionsSelected) => validateField('aiModels', optionsSelected, setNewSections)}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.modal.updateSection.error.aiModels' }),
                },
              ]}
            />
          </ProForm>
        ),
      },
    ];

    return <CVSecForm fields={fields} className={bodyModalCanvasPolygon} />;
  };

  const updateSections = (isEditing) => {
    const name = newSections.name.value.trim();
    const newPolygon = { ...sections };

    if (isEditing) {
      if (newSections.name.value !== sectionSelected) {
        const currentSection = sections[sectionSelected];
        newPolygon[newSections.name.value] = {
          name: newSections.name.value,
          aiModels: newSections.aiModels.value,
          coordinates: currentSection.coordinates,
        };
        delete newPolygon[sectionSelected];
      } else {
        newPolygon[name].aiModels = newSections.aiModels.value;
      }
    } else {
      newPolygon[name] = {
        name,
        aiModels: newSections.aiModels.value,
        coordinates: [],
      };
    }

    setShowModalNewSection(false);
    setShowModalEditSection(false);
    setNewSections(initialSections());
    setSectionSelected(newSections.name.value.trim());
    setSections(newPolygon);
  };

  const validateSection = () => {
    let isValidated = true;
    const copyNewSections = { ...newSections };
    const { validate: validateName, value: valueName } = copyNewSections.name;
    const { value: valueAIModels } = copyNewSections.aiModels;

    if (!valueName || !valueName.trim().length) {
      isValidated = false;
      copyNewSections.name.msg = intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.modal.updateSection.error.name' });
      copyNewSections.name.validate = false;
    } else if (!validateName) {
      isValidated = false;
      copyNewSections.name.msg = intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.modal.updateSection.error.name.duplicate' });
      copyNewSections.name.validate = false;
    }

    if (!valueAIModels || !valueAIModels.length) {
      propFormRef.current.submit();
      isValidated = false;
      copyNewSections.aiModels.msg = intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.modal.updateSection.error.aiModels' });
      copyNewSections.aiModels.validate = false;
    }

    if (isValidated) {
      updateSections(showModalEditSection);
    } else {
      setNewSections(copyNewSections);
    }
  };

  const setSectionToEdit = (section) => {
    const sectionToEdit = {
      name: {
        value: sectionSelected,
        validate: true,
        msg: '',
      },
      aiModels: {
        value: section.aiModels,
        validate: true,
        msg: '',
      },
    };

    setNewSections(sectionToEdit);
    setShowModalEditSection(true);
  };

  const deleteSection = () => {
    const newPolygon = { ...sections };

    delete newPolygon[sectionSelected];

    const firstKey = Object.keys(newPolygon)[0];

    setShowModalDeleteSection(false);
    setSectionSelected(firstKey);
    setSections(newPolygon);
  };

  useEffect(() => {
    if (sections && Object.keys(sections).length && !sectionSelected) {
      const firstKey = Object.keys(sections)[0];
      setSectionSelected(firstKey);
    }
  }, [sections, sectionSelected]);

  useEffect(() => {
    document.querySelectorAll('.canvasPolygon').forEach((canvas) => {
      canvas.style.zIndex = 1;
      canvas.style.opacity = 0.5;
    });
    if (sectionSelected) {
      const editingCanvas = document.getElementById(sectionSelected);
      editingCanvas.style.zIndex = 9;
      editingCanvas.style.opacity = 1;
    }
  }, [sectionSelected]);

  useEffect(() => {
    if (enabledDrawing && sectionSelected) {
      const editingCanvas = document.getElementById(sectionSelected);
      editingCanvas.style.zIndex = 9;
      editingCanvas.style.opacity = 1;
    } else {
      document.querySelectorAll('.canvasPolygon').forEach((canvas) => {
        canvas.style.zIndex = 1;
        canvas.style.opacity = 0.5;
      });
    }
  }, [enabledDrawing, sectionSelected]);

  return (
    <div className={containerCanvas}>
      <CustomButton
        className={`${activeDraw} ${isDrawing ? optionsDisabled : ''}`}
        onClick={!isDrawing ? () => setEnabledDrawing((prev) => !prev) : () => {}}
        iconLeft={<img src={enabledDrawing ? notAllowed : handDrawing} alt="iconAction" />}
        msg={intl.formatMessage({ id: `videoStreams.edition.canvasPolygon.${!enabledDrawing ? 'activateDraw' : 'desactivateDraw'}` })}
      />
      {enabledDrawing && Object.keys(sections).length === 0 && (
        <CustomButton
          className={`${!enabledDrawing ? 'hidden' : ''} ${saveEmptySection}`}
          onClick={!isDrawing ? () => saveSections() : () => {}}
          iconLeft={<Floppy />}
          tooltip={intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.save' })}
        />
      )}
      {enabledDrawing && (
        <div className={newSection}>
          {sections && Object.keys(sections).length > 0 && (
            <SelectorSections
              sections={sections}
              sectionSelected={sectionSelected}
              setSectionSelected={setSectionSelected}
              isDrawing={isDrawing}
            />
          )}
          <CustomButton
            className={isDrawing ? disabled : ''}
            iconRight={<PlusSquare />}
            onClick={!isDrawing ? () => setShowModalNewSection(true) : () => {}}
            tooltip={intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.newSection' })}
          />
          {sections && Object.keys(sections).length > 0 && (
            <>
              <CustomButton
                className={isDrawing ? disabled : ''}
                iconRight={<Pencil />}
                onClick={!isDrawing
                  ? () => setSectionToEdit(sections[sectionSelected])
                  : () => {}}
                tooltip={intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.editSection' })}
              />
              <CustomButton
                className={isDrawing ? disabled : ''}
                onClick={() => setShowModalDeleteSection(true)}
                iconLeft={<Trash />}
                tooltip={intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.deleteSection' })}
              />
            </>
          )}

        </div>
      )}
      {sections && Object.keys(sections).length > 0
        && Object.entries(sections).map(([key, section]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'center' }}>
            <Canvas
              id={key}
              width={canvasWidth}
              height={canvasHeight}
              saveSections={saveSections}
              polygonCoordinates={section.coordinates}
              isDrawing={isDrawing}
              setIsDrawing={setIsDrawing}
              enabledDrawing={enabledDrawing}
              setEnabledDrawing={setEnabledDrawing}
              setSections={setSections}
            />
          </div>
        ))}
      <CVSecModal
        open={showModalNewSection}
        title={intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.modal.newSection.title' })}
        body={getBodyModal()}
        btnAccept={() => validateSection()}
        btnCancel={() => { setShowModalNewSection(false); setNewSections(initialSections()); }}
        size="md"
      />
      <CVSecModal
        open={showModalEditSection}
        title={intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.modal.editSection.title' })}
        body={getBodyModal(true)}
        btnAccept={() => validateSection()}
        btnCancel={() => { setShowModalEditSection(false); setNewSections(initialSections()); }}
        size="md"
      />
      <CVSecModal
        open={showModalDeleteSection}
        title={intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.modal.deleteSection.title' })}
        body={(
          <span>
            {intl.formatMessage(
              { id: 'videoStreams.edition.canvasPolygon.modal.deleteSection.body' },
              { section: sectionSelected },
            )}
          </span>
        )}
        btnAccept={() => deleteSection()}
        btnCancel={() => setShowModalDeleteSection(false)}
        size="md"
      />
      <div ref={resourceRef} className={resourceStyle}>
        {resource}
      </div>
    </div>
  );
}

export default injectIntl(CanvasPolygon);
