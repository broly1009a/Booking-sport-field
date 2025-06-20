//Login import to dialog component
import RegisterDialog from '../../components/dialogs/registerDialog';
import bg from '../../assets/bg.jfif';
const Register = () => {
    return (
           <div
                    className="min-h-screen flex items-center justify-center"
                    style={{
                        backgroundImage: `url(${bg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
          <RegisterDialog open={true} setOpen={() => {}} />
        </div>
    );
    }
export default Register;