const AIMODELS_HEADER = {
  id: { sortable: true },
  name: { sortable: true },
  description: { sortable: true },
  aiModelRepository: { sortable: true },
  uri: { sortable: true },
  settings: {},
};

const AIMODEL = {
  name: {
    value: '',
    validate: null,
    msg: '',
  },
  description: {
    value: '',
    validate: null,
    msg: '',
  },
  aiModelRepository: {
    value: '',
    validate: null,
    msg: '',
  },
  newAImodel: {
    value: null,
    validate: null,
    msg: '',
  },
};

const AIMODEL_TO_EDIT = {
  name: {
    value: '',
    validate: true,
    msg: '',
  },
  description: {
    value: '',
    validate: true,
    msg: '',
  },
  aiModelRepository: {
    value: null,
    validate: true,
    msg: '',
  },
  newAImodel: {
    value: null,
    validate: null,
    msg: '',
  },
};

export { AIMODELS_HEADER, AIMODEL, AIMODEL_TO_EDIT };
