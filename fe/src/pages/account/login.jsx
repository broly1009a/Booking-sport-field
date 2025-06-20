//Login import to dialog component
import LoginDialog from '../../components/dialogs/loginDialog';
import bg from '../../assets/bg.jfif';
const Login = () => {
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
          <LoginDialog open={true} setOpen={() => {}} />
        </div>
    );
    }
export default Login;