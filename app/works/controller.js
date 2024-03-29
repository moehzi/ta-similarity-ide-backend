const Course = require('../courses/model');
const Work = require('./model');
const Code = require('../code/model.js');
const Class = require('../class/model.js');
const { default: mongoose } = require('mongoose');
const User = require('../users/model');
const fs = require('fs');

module.exports = {
  createWork: async (req, res) => {
    try {
      const {
        name,
        description,
        codeTest,
        deadline,
        htmlStarter,
        cssStarter,
        jsStarter,
      } = req.body;

      const classCourse = await Class.findOne({
        _id: req.params.id,
      }).populate('author works students');

      const courseClass = await Class.find({
        courseId: classCourse.courseId,
        author: req.user.id,
      }).populate('students');

      //   const isAuthor = classCourse?.author.some(
      //     (element) => element.id === req.user.id
      //   );

      //   if (!isAuthor)
      //     return res.status(403).json({
      //       status: 'FORBIDDEN',
      //       message: 'You are not the author of this course',
      //     });

      const exerciseId = new mongoose.Types.ObjectId();
      courseClass.map(async (singleClass) => {
        const work = await Work({
          name,
          description,
          classId: singleClass._id,
          codeTest,
          exerciseId,
          deadline,
          htmlStarter,
          cssStarter,
          jsStarter,
          courseId: classCourse.courseId,
        });

        const folderName = `./Programs/Work/${work._id}`;
        try {
          if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName);
          }
        } catch (error) {
          console.log(error);
        }

        if (singleClass.students.length > 0) {
          singleClass.students.map(async (student) => {
            const codes = await Code({
              htmlCode: '',
              cssCode: '',
              jsCode: '',
              author: student._id,
              status: 'Not Completed',
              workId: work._id,
              classId: singleClass._id,
              courseId: classCourse.courseId,
            });

            const folderStudent = `${folderName}/${student.registrationNumber}`;
            try {
              if (!fs.existsSync(folderStudent)) {
                fs.mkdirSync(folderStudent);
              }
            } catch (error) {
              console.log(error);
            }

            work.code.push(codes._id);
            await codes.save();
          });
        }

        singleClass.works.push(work._id);
        await singleClass.save();
        await work.save();
      });

      //   if (classCourse.students.length > 0) {
      //     classCourse.students.map(async (v) => {
      //       const codes = await Code({
      //         htmlCode: '',
      //         cssCode: '',
      //         jsCode: '',
      //         author: v._id,
      //         status: 'Not Completed',
      //         workId: work._id,
      //         classId: classCourse._id,
      //       });
      //       work.code.push(codes);
      //       await codes.save();
      //     });
      //   }

      //   classCourse.works.push(work);
      //   await work.save();
      //   await classCourse.save();

      return res.status(200).json({
        status: 'OK',
        message: 'Successfully created work',
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  editWork: async (req, res) => {
    try {
      const {
        name,
        description,
        codeTest,
        deadline,
        htmlStarter,
        cssStarter,
        jsStarter,
      } = req.body;
      const work = await Work.findOneAndUpdate(
        { _id: req.params.id },
        {
          name,
          description,
          codeTest,
          deadline,
          htmlStarter,
          cssStarter,
          jsStarter,
        }
      );

      return res.status(200).json({
        status: 'OK',
        message: 'Succesfully update work',
        data: work,
      });
    } catch (error) {
      console.log(error);
    }
  },

  deleteWork: async (req, res) => {
    try {
      const work = await Work.findOneAndDelete({ _id: req.params.id });

      const isAuthor = await Work.findOne({ author: { _id: req.user.id } });

      if (!isAuthor)
        return res.status(403).json({
          status: 'FORBIDDEN',
          message: 'You are not the author of this course',
        });

      if (!work)
        return res.status(404).json({ status: 'Fail', message: 'Not found' });

      return res.status(200).json({
        status: 'OK',
        message: 'Delete sucessfully',
      });
    } catch (error) {
      console.log(error);
    }
  },

  getWorkById: async (req, res) => {
    try {
      const work = await Work.findById({ _id: req.params.id }).populate({
        path: 'code',
        populate: {
          path: 'author',
          select: 'name',
        },
      });

      const codeTeacher = await Code.find({
        workId: req.params.id,
      }).populate({ path: 'workId', populate: { path: 'code' } });

      const getStatus = codeTeacher.map((v) => v.status);

      if (!getStatus.includes('Not Completed')) {
        await Work.findOneAndUpdate(
          { _id: req.params.id },
          { status: 'Ready to review' }
        );

        fs.rm(
          `./Programs/Work/${req.params.id}`,
          {
            recursive: true,
            force: true,
          },
          (err) => {
            if (err) {
              console.log(err.message);
            }
          }
        );
      }

      return res.status(200).json({
        status: 'OK',
        data: work,
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  changeVisibleWork: async (req, res) => {
    try {
      const work = await Work.findOne({ _id: req.params.id });

      await Work.findOneAndUpdate(
        { _id: req.params.id },
        { isVisible: !work.isVisible }
      );

      return res.status(200).json({
        status: 'OK',
        message: 'Succesfully change the visible of work',
      });
    } catch (error) {
      console.log(error);
    }
  },
};
