/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { Container } from 'reactstrap';
import { notification } from 'antd';
import {
  useGetAImodelsQuery,
  useDeleteAImodelsMutation,
  useCreateAImodelMutation,
  useUpdateAImodelMutation,
} from '../../services/redux/aiModel/api';
import {
  useCreateAImodelInRepositoryMutation,
  useGetAImodelsInRepositoryQuery,
  useLazyGetAImodelsInRepositoryQuery,
} from '../../services/redux/mino/api';
import CVSecModal from '../../components/CVSecModal';
import CVSecForm from '../../components/CVSecForm';
import { AIMODELS_HEADER, AIMODEL, AIMODEL_TO_EDIT } from './data/datas';
import CVSecTable from '../../components/CVSecTable';
import settingIcon from '../../resources/pages/dashboards/settings.svg';
import styles from './styles.module.scss';
import loading from '../../resources/pages/general/spinner.png';

const {
  containerAImodels, notRegisters, spinnerContainer,
  cvsecSwitch, containerSwitch, optionSwitch, buttonSwitch, selected,
} = styles;

const initalAImodel = () => ({
  name: { ...AIMODEL.name },
  description: { ...AIMODEL.description },
  aiModelRepository: { ...AIMODEL.aiModelRepository },
  newAImodel: { ...AIMODEL.newAImodel },
});

const initalAImodelToEdit = () => ({
  name: { ...AIMODEL_TO_EDIT.name },
  description: { ...AIMODEL_TO_EDIT.description },
  aiModelRepository: { ...AIMODEL_TO_EDIT.aiModelRepository },
  newAImodel: { ...AIMODEL_TO_EDIT.newAImodel },
});

function AImodels({ intl }) {
  const [api, contextHolder] = notification.useNotification();
  const [notifications, setNotifications] = useState();
  const [showModalCreaction, setShowModalCreaction] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [aiModelsOptions, setAImodelsOptions] = useState({});
  const [newAImodel, setNewAImodel] = useState(initalAImodel());
  const [uploadFile, setUploadFile] = useState(0);
  const [aiModelToEdit, setAImodelToEdit] = useState({});
  const [newAImodelIsUploaded, setNewAImodelIsUploaded] = useState({ uploaded: false, action: '' });
  const [query, setQuery] = useState({ name: '', page: 1, limit: 5 });
  const { data: aiModelList, isError: errorList } = useGetAImodelsQuery(query);
  const {
    data: aiModelsInRepository, error: aiModelsInRepositoryError,
  } = useGetAImodelsInRepositoryQuery();
  const [
    getAImodelsInRepository,
    { data: newAImodelsInRepository, isError: getAImodelsInRepositoryError },
  ] = useLazyGetAImodelsInRepositoryQuery();
  const [
    deleteAImodels,
    { isSuccess: aiModelDeletedSuccess, isError: aiModelDeletedError },
  ] = useDeleteAImodelsMutation();
  const [
    createAImodels,
    { isSuccess: aiModelCreatedSuccess, isError: aiModelCreatedError },
  ] = useCreateAImodelMutation();
  const [
    createAImodelsInRepository,
    {
      data: aiModelInRepositoryCreated,
      isError: aiModelInRepositoryCreatedError,
      error: aiModelInRepositoryCreatedErrorObject,
      isLoading: aiModelInRepositoryLoading,
    },
  ] = useCreateAImodelInRepositoryMutation();
  const [
    updateAImodel,
    { isSuccess: aiModelEditedSuccess, isError: aiModelEditedError },
  ] = useUpdateAImodelMutation();

  const editModelAction = (aiModel) => {
    const newAImodelToEdit = initalAImodelToEdit();
    newAImodelToEdit.name.value = aiModel.name;
    newAImodelToEdit.description.value = aiModel.description;
    newAImodelToEdit.aiModelRepository.value = aiModel.aiModelRepository;
    newAImodelToEdit.uri = aiModel.uri;
    newAImodelToEdit.id = aiModel.id;
    setAImodelToEdit(newAImodelToEdit);
  };

  const getActions = () => ([
    {
      key: 'settings',
      icon: (<img src={settingIcon} alt="iconAction" />),
      action: (aiModel) => editModelAction(aiModel),
    },
  ]);

  const validateField = (field, value, action, trigger) => {
    switch (field) {
      case 'name': trigger((prev) => ({
        ...prev,
        [field]: {
          value,
          validate: value.length >= 5 && value.length < 31,
          msg: intl.formatMessage({ id: `aiModels.${action}.modal.error.name` }),
        },
      }));
        break;
      case 'description': trigger((prev) => ({
        ...prev,
        [field]: {
          value,
          validate: value.length >= 0 && value.length < 301,
          msg: intl.formatMessage({ id: `aiModels.${action}.modal.error.description` }),
        },
      }));
        break;
      case 'aiModelRepository': trigger((prev) => ({
        ...prev,
        [field]: {
          value,
          validate: aiModelsOptions[value].length > 0,
          msg: intl.formatMessage({ id: `aiModels.${action}.modal.error.aiModelRepository` }),
        },
      }));
        break;
      case 'newAImodel': {
        let msg = '';
        if (!value || value?.size <= 0) {
          msg = intl.formatMessage({ id: `aiModels.${action}.modal.error.newAImodel` });
        } else if (!value?.name.includes('.pt')) {
          msg = intl.formatMessage({ id: `aiModels.${action}.modal.error.newAImodelExtension` });
        }
        trigger((prev) => ({
          ...prev,
          [field]: {
            value,
            validate: value?.size > 0 && value?.name.includes('.pt'),
            msg,
          },
        }));
      }
        break;
      default: action((prev) => ({ ...prev, name: value }));
        break;
    }
  };

  const resetForm = () => {
    setNewAImodel(initalAImodel());
    const inputFile = document.getElementById('inputFileNewModel');
    if (inputFile) {
      inputFile.value = null;
    }
    setUploadFile(0);
  };

  const validateAndUpdate = (aiModel, action) => {
    let isValidated = true;
    const aiModelToUpload = {};
    const aiModelValidated = {};

    Object.entries(aiModel).forEach(([key, params]) => {
      let changeValueField = false;
      let keyTraduction = key;
      if (aiModel[key].value) {
        aiModelValidated[key] = {
          value: aiModel[key].value,
          validate: aiModel[key].validate,
          msg: aiModel[key].msg,
        };
        if (key === 'newAImodel' && aiModel[key].msg.includes('.pt')) {
          keyTraduction = 'newAImodelExtension';
        }
      } else {
        aiModelValidated[key] = aiModel[key];
      }

      if (key === 'aiModelRepository' || key === 'newAImodel') {
        if (key === 'aiModelRepository' && !uploadFile && !params.validate) {
          changeValueField = true;
        }
        if (key === 'newAImodel' && uploadFile && !params.validate) {
          changeValueField = true;
        }
      } else if (key === 'name' && !params.validate) {
        changeValueField = true;
      } else if (key === 'description' && params.validate !== null && !params.validate) {
        changeValueField = true;
      }

      if (changeValueField) {
        aiModelValidated[key].validate = false;
        aiModelValidated[key].msg = intl.formatMessage({ id: `aiModels.creation.modal.error.${keyTraduction}` });
        isValidated = false;
      }

      aiModelToUpload[key] = params.value ?? params;
    });

    if (isValidated) {
      if (uploadFile) {
        const formData = new FormData();
        formData.append('newAImodel', aiModelToUpload.newAImodel);
        createAImodelsInRepository(formData);
        setNewAImodelIsUploaded({ uploaded: true, action });
        setNewAImodel(aiModelValidated);
      } else if (action === 'creation') {
        createAImodels(aiModelToUpload);
        setShowModalCreaction(false);
      } else {
        updateAImodel(aiModelToUpload);
        setShowModalEdit(false);
      }
    } else if (action === 'creation') {
      setNewAImodel(aiModelValidated);
    } else {
      setAImodelToEdit(aiModelValidated);
    }
  };

  const getIndxOpt = () => {
    const indxFound = Object.keys(aiModelsOptions).findIndex(
      (opt) => opt === newAImodel.aiModelRepository.value,
    );
    const indxOption = indxFound >= 0 ? indxFound : 0;

    return Object.keys(aiModelsOptions)[indxOption];
  };

  const getSwitch = () => {
    const selectTab = (ind) => {
      document.querySelectorAll('.optionTab').forEach((element) => {
        element.classList.remove(selected);
      });
      document.getElementById(`optionTab${ind}`).classList.add(selected);
      const widhContainer = (document.getElementById('containerSwitch').offsetWidth / 2) + 2;

      if (ind) {
        document.getElementById('buttonSwitch').style.transform = `translate(${widhContainer}px)`;
      } else {
        document.getElementById('buttonSwitch').style.transform = 'translate(4px)';
      }

      setUploadFile(ind);
    };
    const switchOptions = [
      intl.formatMessage({ id: 'aiModels.creation.modal.switchOptions.createdModels' }),
      intl.formatMessage({ id: 'aiModels.creation.modal.switchOptions.newModels' }),
    ];
    return (
      <div className={cvsecSwitch}>
        <div className={containerSwitch} id="containerSwitch">
          {switchOptions.map((opt, ind) => (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
              key={opt}
              id={`optionTab${ind}`}
              className={`${optionSwitch} ${(uploadFile === ind) && selected} optionTab`}
              type="button"
              onClick={() => selectTab(ind)}
            >
              {opt}
            </div>
          ))}
          <div id="buttonSwitch" className={buttonSwitch} />
        </div>
      </div>
    );
  };

  const getModalBodyCreaction = () => {
    const fields = [
      {
        type: 'text',
        label: intl.formatMessage({ id: 'aiModels.creation.modal.name' }),
        id: 'inputNameCreation',
        value: newAImodel.name.value,
        placeholder: intl.formatMessage({ id: 'aiModels.creation.modal.name.placeholder' }),
        disableValidation: newAImodel.name.validate === null,
        valid: newAImodel.name.validate,
        msg: newAImodel.name.msg,
        maxLength: 31,
        onChange: (input) => validateField('name', input.value, 'creation', setNewAImodel),
      },
      {
        type: 'textarea',
        label: intl.formatMessage({ id: 'aiModels.creation.modal.description' }),
        id: 'textareaDescriptionCreation',
        value: newAImodel.description.value,
        placeholder: intl.formatMessage({ id: 'aiModels.creation.modal.description.placeholder' }),
        valid: newAImodel.description.validate,
        disableValidation: newAImodel.description.validate === null,
        msg: newAImodel.description.msg,
        rows: 5,
        maxLength: 301,
        onChange: (textarea) => validateField('description', textarea.value, 'creation', setNewAImodel),
      },
      {
        type: 'select',
        label: intl.formatMessage({ id: 'aiModels.creation.modal.aiModelRepository' }),
        value: getIndxOpt(),
        id: 'selectModelCreation',
        options: aiModelsOptions,
        classContent: uploadFile ? 'hidden' : '',
        valid: newAImodel.aiModelRepository.validate,
        disableValidation: newAImodel.aiModelRepository.validate === null,
        msg: newAImodel.aiModelRepository.msg,
        onChange: (opt) => validateField('aiModelRepository', opt.value, 'creation', setNewAImodel),
      },
      {
        type: 'file',
        label: intl.formatMessage({ id: 'aiModels.creation.modal.newAImodel' }),
        id: 'inputFileNewModel',
        classContent: uploadFile ? '' : 'hidden',
        valid: newAImodel.newAImodel.validate,
        disableValidation: newAImodel.newAImodel.validate === null,
        msg: newAImodel.newAImodel.msg,
        onChange: (input) => validateField('newAImodel', input.files[0], 'creation', setNewAImodel),
      },
      {
        type: 'external',
        id: 'switchCreation',
        component: getSwitch(),
      },
    ];
    return (
      <div>
        {aiModelInRepositoryLoading
          ? (
            <>
              <div className={spinnerContainer}>
                <img src={loading} alt="loading" />
              </div>
              <p>{intl.formatMessage({ id: 'aiModels.creation.modal.uploading' })}</p>
            </>
          )
          : <CVSecForm fields={fields} />}
      </div>
    );
  };

  const getModalBodyEdit = () => {
    let fields = [];
    if (Object.keys(aiModelToEdit).length) {
      fields = [
        {
          type: 'text',
          label: intl.formatMessage({ id: 'aiModels.edit.modal.name' }),
          id: 'inputNameEdit',
          value: aiModelToEdit.name.value,
          placeholder: intl.formatMessage({ id: 'aiModels.edit.modal.name.placeholder' }),
          disableValidation: aiModelToEdit.name.validate === null,
          valid: aiModelToEdit.name.validate,
          msg: aiModelToEdit.name.msg,
          maxLength: 31,
          onChange: (input) => validateField('name', input.value, 'edit', setAImodelToEdit),
        },
        {
          type: 'textarea',
          label: intl.formatMessage({ id: 'aiModels.edit.modal.description' }),
          id: 'textareaDescriptionEdit',
          value: aiModelToEdit.description.value,
          placeholder: intl.formatMessage({ id: 'aiModels.edit.modal.description.placeholder' }),
          valid: aiModelToEdit.description.validate,
          disableValidation: aiModelToEdit.description.validate === null,
          msg: aiModelToEdit.description.msg,
          rows: 5,
          maxLength: 301,
          onChange: (textarea) => validateField('description', textarea.value, 'edit', setAImodelToEdit),
        },
        {
          type: 'select',
          label: intl.formatMessage({ id: 'aiModels.edit.modal.aiModelRepository' }),
          value: aiModelToEdit.aiModelRepository.value,
          id: 'selectModelEdit',
          options: aiModelsOptions,
          classContent: uploadFile ? 'hidden' : '',
          valid: aiModelToEdit.aiModelRepository.validate,
          disableValidation: aiModelToEdit.aiModelRepository.validate === null,
          msg: aiModelToEdit.aiModelRepository.msg,
          onChange: (opt) => validateField('aiModelRepository', opt.value, 'edit', setAImodelToEdit),
        },
        {
          type: 'info',
          id: 'infoURIEdit',
          classContent: uploadFile ? 'hidden' : '',
          label: intl.formatMessage({ id: 'aiModels.edit.modal.uri' }),
          value: aiModelToEdit.uri,
        },
        {
          type: 'file',
          label: intl.formatMessage({ id: 'aiModels.edit.modal.newAImodel' }),
          id: 'inputFileNewModel',
          classContent: uploadFile ? '' : 'hidden',
          valid: aiModelToEdit.newAImodel.validate,
          disableValidation: aiModelToEdit.newAImodel.validate === null,
          msg: aiModelToEdit.newAImodel.msg,
          onChange: (input) => validateField('newAImodel', input.files[0], 'edit', setAImodelToEdit),
        },
        {
          type: 'external',
          id: 'switchEdit',
          component: getSwitch(),
        },
      ];
    }
    return (
      <div>
        {aiModelInRepositoryLoading
          ? (
            <>
              <div className={spinnerContainer}>
                <img src={loading} alt="loading" />
              </div>
              <p>{intl.formatMessage({ id: 'aiModels.creation.modal.uploading' })}</p>
            </>
          )
          : <CVSecForm fields={fields} />}
      </div>
    );
  };

  const addAImodelsOption = (repositoryModels) => {
    const newOptions = {};
    newOptions[intl.formatMessage({ id: 'aiModels.creation.modal.select.disabledOption' })] = intl.formatMessage({ id: 'aiModels.creation.modal.select.disabledOption' });
    repositoryModels.forEach((model) => {
      const [, second] = model.split('/');
      newOptions[model] = second;
    });
    setAImodelsOptions(newOptions);
  };

  useEffect(() => {
    const isNotEmpty = aiModelsInRepository?.length;
    if (isNotEmpty) {
      addAImodelsOption(aiModelsInRepository);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiModelsInRepository, intl]);

  useEffect(() => {
    const isNotEmpty = newAImodelsInRepository?.length;
    if (isNotEmpty) {
      addAImodelsOption(newAImodelsInRepository);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newAImodelsInRepository, intl]);

  useEffect(() => {
    const noticeData = { placement: 'top' };
    switch (notifications?.result) {
      case 'success':
        noticeData.message = intl.formatMessage({ id: `aiModels.notice.${notifications.action}.success.title` });
        api.success(noticeData);
        break;
      case 'error':
        noticeData.message = intl.formatMessage({ id: `aiModels.notice.${notifications.action}.error.title` });
        noticeData.description = intl.formatMessage({ id: `aiModels.notice.${notifications.action}.error.description` });
        api.error(noticeData);
        break;
      default: break;
    }
  }, [api, intl, notifications]);

  useEffect(() => {
    if (aiModelDeletedSuccess) {
      setNotifications({ result: 'success', action: 'deleteRegister' });
    } else if (aiModelDeletedError) {
      setNotifications({ result: 'error', action: 'deleteRegister' });
    }
  }, [aiModelDeletedSuccess, aiModelDeletedError, intl, api]);

  useEffect(() => {
    if (aiModelCreatedSuccess) {
      setNotifications({ result: 'success', action: 'createRegister' });
      getAImodelsInRepository();
    } else if (aiModelCreatedError) {
      setNotifications({ result: 'error', action: 'createRegister' });
    }
    resetForm();
  }, [aiModelCreatedSuccess, aiModelCreatedError, intl, api, getAImodelsInRepository]);

  useEffect(() => {
    if (aiModelInRepositoryCreatedError) {
      const action = aiModelInRepositoryCreatedErrorObject.status === 302 ? 'createAImodelInRepositoryFound' : 'createAImodelInRepository';
      setNotifications({ result: 'error', action });
      const getModelWithError = (model, actionModel) => ({
        ...model,
        newAImodel: {
          ...model.newAImodel,
          validate: false,
          msg: intl.formatMessage({ id: `aiModels.${actionModel}.modal.error.newAImodel` }),
        },
      });
      if (newAImodelIsUploaded.action === 'creation') {
        setNewAImodel((prev) => getModelWithError(prev, 'creation'));
      } else {
        setAImodelToEdit((prev) => getModelWithError(prev, 'edit'));
      }
      document.getElementById('optionTab1').classList.add(selected);
      const widhContainer = (document.getElementById('containerSwitch').offsetWidth / 2) + 2;
      document.getElementById('buttonSwitch').style.transform = `translate(${widhContainer}px)`;
    }
  }, [aiModelInRepositoryCreatedError, aiModelInRepositoryCreatedErrorObject,
    intl, api, newAImodelIsUploaded]);

  useEffect(() => {
    if (aiModelsInRepositoryError || getAImodelsInRepositoryError) {
      setNotifications({ result: 'error', action: 'aiModelInRepository' });
    }
  }, [aiModelsInRepositoryError, getAImodelsInRepositoryError, intl, api]);

  useEffect(() => {
    if (aiModelEditedSuccess) {
      setNotifications({ result: 'success', action: 'editRegister' });
      getAImodelsInRepository();
    } else if (aiModelEditedError) {
      setNotifications({ result: 'error', action: 'editRegister' });
    }
    resetForm();
  }, [aiModelEditedSuccess, aiModelEditedError, intl, api, getAImodelsInRepository]);

  useEffect(() => {
    if (aiModelInRepositoryCreated && newAImodelIsUploaded.uploaded) {
      const aiModelToUpload = {};
      Object.entries(newAImodel).forEach(([key, value]) => {
        if (key !== 'newAImodel') {
          aiModelToUpload[key] = value.value ?? value;
        }
      });
      aiModelToUpload.aiModelRepository = aiModelInRepositoryCreated.name;

      if (newAImodelIsUploaded.action === 'creation') {
        createAImodels(aiModelToUpload);
        setShowModalCreaction(false);
      } else {
        updateAImodel(aiModelToUpload);
        setShowModalEdit(false);
      }
      setNewAImodelIsUploaded((prev) => ({ ...prev, uploaded: false }));
      setUploadFile(0);
    }
  }, [
    aiModelInRepositoryCreated, aiModelToEdit, createAImodels,
    newAImodel, newAImodelIsUploaded, updateAImodel,
  ]);

  useEffect(() => {
    if (aiModelToEdit && Object.keys(aiModelToEdit).length) {
      setShowModalEdit(true);
    }
  }, [aiModelToEdit]);

  if (errorList) {
    return (
      <Container className={containerAImodels}>
        <div className={`noticeNotRegister ${notRegisters}`}>
          {intl.formatMessage({ id: 'aiModels.error.getAImodelsList' })}
        </div>
      </Container>
    );
  }

  return (
    <Container className={containerAImodels}>
      {contextHolder}
      <CVSecTable
        headers={AIMODELS_HEADER}
        body={aiModelList?.data}
        getQuery={setQuery}
        totalItems={aiModelList?.total}
        name="aiModels"
        actions={getActions()}
        selectabled
        searchItem
        itemFroEachPage
        newItem={() => setShowModalCreaction(true)}
        deleteItem={deleteAImodels}
      />
      <CVSecModal
        open={showModalCreaction}
        title={intl.formatMessage({ id: 'aiModels.modal.title.create' })}
        body={getModalBodyCreaction()}
        btnAccept={() => validateAndUpdate(newAImodel, 'creation')}
        btnCancel={() => { setShowModalCreaction(false); resetForm(); }}
        disabledBtnAccept={aiModelInRepositoryLoading}
        size="lg"
      />
      <CVSecModal
        open={showModalEdit}
        title={intl.formatMessage({ id: 'aiModels.modal.title.edit' })}
        body={getModalBodyEdit()}
        btnAccept={() => validateAndUpdate(aiModelToEdit, 'edit')}
        btnCancel={() => { setShowModalEdit(false); setUploadFile(0); }}
        disabledBtnAccept={aiModelInRepositoryLoading}
        size="lg"
      />
    </Container>
  );
}

export default injectIntl(AImodels);
