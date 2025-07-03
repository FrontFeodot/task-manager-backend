export const getBoardListPipeline = ({
  userId,
  userEmail,
  boardId,
}: {
  userId?: string;
  userEmail?: string;
  boardId?: string;
}) => [
  {
    $match: {
      ...(boardId ? { boardId } : {}),
      ...(userId && userEmail
        ? { $or: [{ userId: userId }, { members: userEmail }] }
        : {}),
    },
  },
  {
    $lookup: {
      from: 'tasks',
      let: { boardId: '$boardId' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$boardId', '$$boardId'] },
          },
        },
        {
          $project: {
            _id: 0,
            __v: 0,
          },
        },
      ],
      as: 'tasksArray',
    },
  },

  {
    $addFields: {
      tasks: {
        $arrayToObject: {
          $map: {
            input: '$tasksArray',
            as: 'task',
            in: {
              k: { $toString: '$$task.taskId' },
              v: '$$task',
            },
          },
        },
      },
    },
  },

  {
    $project: {
      _id: 0,
      __v: 0,
      'columns._id': 0,
      tasksArray: 0,
    },
  },

  {
    $group: {
      _id: null,
      boards: {
        $push: {
          k: '$boardId',
          v: '$$ROOT',
        },
      },
    },
  },

  {
    $replaceRoot: {
      newRoot: {
        $arrayToObject: '$boards',
      },
    },
  },
];
